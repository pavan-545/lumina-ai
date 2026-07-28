import React, { useState, useEffect } from 'react';
import { X, Shield, RefreshCw, Check, AlertTriangle, Download, Upload, Trash2, Sliders, Eye } from 'lucide-react';
import { aiOrchestrator } from '../services/aiOrchestrator';

export function SettingsModal({ onClose, onImportHistory, onExportHistory, historyCount, studentProfile, onResetProfile }) {
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [apiDetails, setApiDetails] = useState(null);

  // Settings states loaded from localStorage
  const [devMode, setDevMode] = useState(() => localStorage.getItem('lumina_dev_mode') === 'true');
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('lumina_reduced_motion') === 'true');
  const [theme, setTheme] = useState(() => localStorage.getItem('lumina_theme') || 'dark');
  const [defaultGoal, setDefaultGoal] = useState(() => localStorage.getItem('lumina_default_goal') || 'Learn From Scratch');

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    setApiStatus('checking');
    try {
      // Direct post to check key verification
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'recommendation', notes: '', context: {} })
      });
      if (res.ok) {
        setApiStatus('online');
        setApiDetails({ hasApiKey: true });
      } else {
        const errorRes = await res.json().catch(() => ({}));
        if (errorRes.error === 'API_KEY_MISSING') {
          setApiStatus('online');
          setApiDetails({ hasApiKey: false });
        } else {
          setApiStatus('offline');
        }
      }
    } catch (e) {
      setApiStatus('offline');
    }
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            onImportHistory(imported);
            alert(`Successfully imported ${imported.length} study sessions!`);
          } else {
            alert('Invalid history file format. Must be a JSON array.');
          }
        } catch (err) {
          alert('Failed to parse history JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleSaveSettings = () => {
    localStorage.setItem('lumina_dev_mode', devMode.toString());
    localStorage.setItem('lumina_reduced_motion', reducedMotion.toString());
    localStorage.setItem('lumina_theme', theme);
    localStorage.setItem('lumina_default_goal', defaultGoal);

    // Unify event dispatch
    aiOrchestrator.emit('SETTINGS_UPDATED', { devMode, reducedMotion, theme, defaultGoal });
    onClose();
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear the AI responses cache? This will force the app to re-generate materials for active sessions.')) {
      aiOrchestrator.clearCache();
      alert('AI Cache cleared successfully.');
    }
  };

  const handleResetProfile = () => {
    if (window.confirm('WARNING: Are you sure you want to reset your student profile? This will wipe your XP, Level, Achievements, Streaks, and Mistakes notebook.')) {
      onResetProfile();
      alert('Profile reset successfully.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} style={{ color: 'var(--accent-emerald)' }} /> Lumina Settings
          </h3>
          <button 
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '4px', border: 0, background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
          
          {/* API Status checker */}
          <div style={{ 
            padding: '14px', 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: '600' }}>AI Gateway Status</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {apiStatus === 'online' 
                  ? (apiDetails?.hasApiKey ? 'Express Proxy Active & Key verified' : 'Proxy Active, but API Key is missing!')
                  : apiStatus === 'checking' ? 'Testing endpoint connectivity...' : 'Express server offline'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {apiStatus === 'checking' && (
                <RefreshCw size={14} className="loading-pulse" style={{ color: 'var(--text-muted)' }} />
              )}
              {apiStatus === 'online' && apiDetails?.hasApiKey && (
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  color: 'var(--accent-emerald)', 
                  backgroundColor: 'var(--accent-emerald-light)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  <Check size={12} /> SECURE
                </span>
              )}
              {(apiStatus === 'offline' || (apiStatus === 'online' && !apiDetails?.hasApiKey)) && (
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  color: 'var(--accent-red)', 
                  backgroundColor: 'var(--accent-red-light)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  <AlertTriangle size={12} /> OFFLINE
                </span>
              )}
            </div>
          </div>

          {/* Preferences Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontWeight: '600', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Preferences</div>
            
            {/* Theme */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="setting-theme" style={{ color: 'var(--text-secondary)' }}>Color Palette Theme</label>
              <select id="setting-theme" className="input-field" style={{ width: '120px', padding: '4px 8px' }} value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="dark">Graphite Dark</option>
                <option value="light">Classic Light</option>
              </select>
            </div>

            {/* Default Goal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="setting-goal" style={{ color: 'var(--text-secondary)' }}>Default Learning Goal</label>
              <select id="setting-goal" className="input-field" style={{ width: '160px', padding: '4px 8px' }} value={defaultGoal} onChange={(e) => setDefaultGoal(e.target.value)}>
                <option value="Learn From Scratch">Learn From Scratch</option>
                <option value="Quick Revision">Quick Revision</option>
                <option value="Exam Preparation">Exam Preparation</option>
                <option value="Interview Preparation">Interview Prep</option>
              </select>
            </div>

            {/* Developer Mode */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <Eye size={14} /> Developer Debug Console
              </label>
              <input type="checkbox" checked={devMode} onChange={(e) => setDevMode(e.target.checked)} style={{ accentColor: 'var(--accent-emerald)' }} />
            </div>

            {/* Reduced Motion */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ color: 'var(--text-secondary)' }}>Reduced Animation Motion</label>
              <input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} style={{ accentColor: 'var(--accent-emerald)' }} />
            </div>
          </div>

          {/* Backup & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <div style={{ fontWeight: '600', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Backups & Maintenance</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={onExportHistory}
                disabled={historyCount === 0}
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '8px 12px', fontSize: '11px' }}
              >
                <Download size={12} /> Export Backup ({historyCount})
              </button>
              <button 
                onClick={handleImportClick}
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '8px 12px', fontSize: '11px' }}
              >
                <Upload size={12} /> Restore Backup
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button 
                onClick={handleClearCache}
                className="btn btn-ghost" 
                style={{ flex: 1, padding: '8px 12px', fontSize: '11px', color: 'var(--accent-amber)', border: '1px solid var(--border-color)' }}
              >
                <Trash2 size={12} /> Clear AI Cache
              </button>
              <button 
                onClick={handleResetProfile}
                className="btn btn-ghost" 
                style={{ flex: 1, padding: '8px 12px', fontSize: '11px', color: 'var(--accent-red)', border: '1px solid var(--border-color)' }}
              >
                <Trash2 size={12} /> Reset Profile Stats
              </button>
            </div>
          </div>

          {/* System information */}
          <div style={{ 
            fontSize: '11px', 
            color: 'var(--text-muted)', 
            borderTop: '1px solid var(--border-color)', 
            paddingTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div>Platform: <strong>Lumina AI &ndash; Universal AI Agent Workspace</strong></div>
            <div>Data Storage: <strong>Local Browser Sandbox</strong></div>
          </div>

          {/* Footer Save */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button onClick={handleSaveSettings} className="btn btn-primary" style={{ flex: 2 }}>Save Preferences</button>
          </div>

        </div>

      </div>
    </div>
  );
}
export default SettingsModal;
