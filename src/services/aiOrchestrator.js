import { validateAndScoreResponse } from '../utils/aiValidation';

/**
 * Hash function to create cache keys from notes and parameters
 */
function hashString(str) {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

class AIOrchestratorService {
  constructor() {
    this.listeners = {};
    this.cache = this.loadCache();
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.debugLogs = [];
  }

  // --- EVENT SYSTEM ---
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try { cb(data); } catch (e) { console.error(`Error in event listener for ${event}:`, e); }
      });
    }
  }

  // --- LOCAL CACHE MANAGER ---
  loadCache() {
    try {
      const stored = localStorage.getItem('lumina_ai_cache');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Error loading AI Cache:', e);
      return {};
    }
  }

  saveCache() {
    try {
      localStorage.setItem('lumina_ai_cache', JSON.stringify(this.cache));
    } catch (e) {
      console.warn('LocalStorage quota exceeded, clearing old cache keys...');
      this.cache = {};
      localStorage.removeItem('lumina_ai_cache');
    }
  }

  clearCache() {
    this.cache = {};
    localStorage.removeItem('lumina_ai_cache');
    this.emit('CACHE_CLEARED');
  }

  getCacheKey(notes, mode, level = '', requestType = '', goal = '') {
    const prefix = hashString(notes || '');
    return `${prefix}_${mode}_${level}_${requestType}_${goal}`;
  }

  // --- REQUEST ORCHESTRATION ---
  async request(params) {
    const {
      mode,
      notes = '',
      context = {},
      schema = null,
      level = '',
      type = '',
      challengeData = null,
      studentAnswer = '',
      requestType = '',
      activeSession = null,
      forceRefresh = false
    } = params;

    const cacheKey = this.getCacheKey(notes, mode, level, requestType, context.goal);
    
    // 1. Check Cache
    if (!forceRefresh && this.cache[cacheKey]) {
      const cached = this.cache[cacheKey];
      
      // Log debug info for Developer Mode
      this.logDebug({
        mode,
        notesHash: cacheKey,
        cacheHit: true,
        generationTimeMs: 0,
        parsedData: cached.data,
        rawResponse: 'Returned from localStorage Cache',
        retryCount: 0,
        validationResult: { success: true, confidence: 'Excellent (Cached)' }
      });

      return { data: cached.data, success: true, isCached: true, debug: cached.debug || {} };
    }

    // 2. Queue the Request (Concurrency Limit)
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        params,
        cacheKey,
        resolve,
        reject,
        retries: 0
      });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    this.isProcessingQueue = true;

    const currentTask = this.requestQueue.shift();
    const { params, cacheKey, resolve, reject } = currentTask;
    let attempt = 0;
    const maxRetries = 2;

    const executeRequest = async () => {
      const startTime = Date.now();
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notes: params.notes,
            mode: params.mode,
            context: params.context,
            level: params.level,
            type: params.type,
            challengeData: params.challengeData,
            studentAnswer: params.studentAnswer,
            requestType: params.requestType,
            activeSession: params.activeSession
          })
        });

        // Offline / Connection Failure Fallback
        if (!response.ok) {
          throw new Error(`API response status ${response.status}`);
        }

        const result = await response.json();
        const rawOutput = result.isMalformed ? result.rawText : JSON.stringify(result.data);

        // Validation using Zod
        let validationResult = { success: true, parsedData: result.data };
        if (params.schema) {
          validationResult = validateAndScoreResponse(rawOutput, params.schema);
        }

        if (!validationResult.success) {
          throw new Error(`Zod validation failure: ${validationResult.error || 'Schema Mismatch'}`);
        }

        const responseTime = Date.now() - startTime;

        // Cache the successful outcome
        this.cache[cacheKey] = {
          data: validationResult.parsedData,
          debug: {
            ...result.debug,
            generationTimeMs: responseTime,
            promptSent: `System instructions + context for mode: ${params.mode}`,
            rawResponse: rawOutput,
            validationResult: validationResult,
            retryCount: attempt
          }
        };
        this.saveCache();

        this.logDebug({
          mode: params.mode,
          notesHash: cacheKey,
          cacheHit: false,
          generationTimeMs: responseTime,
          parsedData: validationResult.parsedData,
          rawResponse: rawOutput,
          retryCount: attempt,
          validationResult: validationResult
        });

        resolve({
          data: validationResult.parsedData,
          success: true,
          isCached: false,
          debug: this.cache[cacheKey].debug
        });

      } catch (err) {
        attempt++;
        if (attempt <= maxRetries) {
          console.warn(`AI Orchestrator retrying request (${attempt}/${maxRetries}) for mode: ${params.mode}...`, err);
          setTimeout(executeRequest, 1000);
        } else {
          const responseTime = Date.now() - startTime;
          
          // Fallback to cache if offline/error and we have older cache
          if (this.cache[cacheKey]) {
            console.log('AI Orchestrator Fallback: Using cached value due to request failure.');
            resolve({
              data: this.cache[cacheKey].data,
              success: true,
              isCached: true,
              isOfflineFallback: true,
              debug: this.cache[cacheKey].debug
            });
          } else {
            this.logDebug({
              mode: params.mode,
              notesHash: cacheKey,
              cacheHit: false,
              generationTimeMs: responseTime,
              error: err.message,
              retryCount: attempt - 1
            });
            reject(err);
          }
        }
      }
    };

    await executeRequest();
    this.isProcessingQueue = false;
    this.processQueue();
  }

  // --- DEVELOPER DEBUG METRICS ---
  logDebug(logObj) {
    const entry = {
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substring(7),
      ...logObj
    };
    this.debugLogs.unshift(entry);
    if (this.debugLogs.length > 50) this.debugLogs.pop(); // keep last 50
    this.emit('DEBUG_UPDATED', this.debugLogs);
  }

  getDebugLogs() {
    return this.debugLogs;
  }
}

export const aiOrchestrator = new AIOrchestratorService();
export default aiOrchestrator;
