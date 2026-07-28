import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Terminal, Cpu, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';

export function DeveloperModeConsole({ debug }) {
  const [isOpen, setIsOpen] = useState(false);
  const isEnabled = localStorage.getItem('lumina_dev_mode') === 'true';

  if (!isEnabled || !debug) return null;

  const {
    service = 'AIOrchestrator',
    generationTimeMs = 0,
    model = 'gemini-1.5-flash',
    promptVersion = 'v2.1',
    promptSent = '',
    rawResponse = '',
    validationResult = null,
    retryCount = 0,
    cacheHit = false
  } = debug;

  return (
    <div style={{
      marginTop: '20px',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      overflow: 'hidden'
    }}>
      {/* Toggle header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-surface-hover)',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
          <Terminal size={14} style={{ color: 'var(--accent-emerald)' }} />
          <span>[DEV CONSOLE] Service: {service} &bull; {cacheHit ? 'Cache Hit' : `${generationTimeMs}ms`}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          {isOpen ? <EyeOff size={12} /> : <Eye size={12} />}
          <span>{isOpen ? 'Collapse Details' : 'Expand Details'}</span>
        </div>
      </div>

      {/* Console panel content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ borderTop: '1px solid var(--border-color)', padding: '16px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>Model engine</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Cpu size={12} /> {model}</strong>
              </div>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>Prompt Template</span>
                <strong>{promptVersion}</strong>
              </div>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>Generation Speed</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Clock size={12} /> {generationTimeMs}ms</strong>
              </div>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>Retry schedule</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><RefreshCw size={12} /> {retryCount} Retries</strong>
              </div>
            </div>

            {/* Prompt sent */}
            {promptSent && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>System Prompt & Context Sent:</span>
                <pre style={{
                  margin: 0,
                  padding: '12px',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-secondary)'
                }}>{promptSent}</pre>
              </div>
            )}

            {/* Raw JSON response */}
            {rawResponse && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Raw LLM Text Response:</span>
                <pre style={{
                  margin: 0,
                  padding: '12px',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--accent-emerald)'
                }}>{rawResponse}</pre>
              </div>
            )}

            {/* Zod validations */}
            {validationResult && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: validationResult.success ? 'var(--accent-emerald-light)' : 'var(--accent-amber-light)',
                border: '1px solid',
                borderColor: validationResult.success ? 'var(--accent-emerald-border)' : 'var(--accent-amber-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} style={{ color: validationResult.success ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
                <div>
                  <strong style={{ fontSize: '11px', color: validationResult.success ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                    Schema Validation: {validationResult.confidence || 'Success'} (Score: {validationResult.confidenceScore || 100})
                  </strong>
                  {validationResult.error && (
                    <div style={{ fontSize: '10px', marginTop: '2px', color: 'var(--text-secondary)' }}>
                      Issues: {validationResult.error}
                    </div>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DeveloperModeConsole;
