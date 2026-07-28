import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, ListTodo, Sparkles, Send, Download, CheckSquare, Code, HelpCircle, AlertOctagon, Calendar, BookOpen, Compass
} from 'lucide-react';
import { exportToMarkdown, exportToJSON, exportToPDF } from '../../utils/exporters';

export function GuideView({ 
  studySet = {}, 
  activeSubTab = 'summary', // 'summary', 'cheat_sheet', 'formulas', 'mnemonics', 'guide', or dynamic subject resources
  onRefineStudySet,
  isRefining = false
}) {
  const [refinePrompt, setRefinePrompt] = useState('');
  const [checkedGuideItems, setCheckedGuideItems] = useState(new Set());
  const [revealedSolutions, setRevealedSolutions] = useState(new Set());

  const handleRefineSubmit = (e) => {
    e.preventDefault();
    if (!refinePrompt.trim() || isRefining) return;
    onRefineStudySet(refinePrompt);
    setRefinePrompt('');
  };

  const handleToggleGuideItem = (idx) => {
    const newChecked = new Set(checkedGuideItems);
    if (newChecked.has(idx)) {
      newChecked.delete(idx);
    } else {
      newChecked.add(idx);
    }
    setCheckedGuideItems(newChecked);
  };

  const handleToggleSolution = (idx) => {
    const next = new Set(revealedSolutions);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setRevealedSolutions(next);
  };

  const handleExport = (format) => {
    const title = studySet.title || 'Study Session';
    const cleanTitle = title.replace(/\s+/g, '_').toLowerCase();

    if (format === 'json') {
      exportToJSON(studySet, cleanTitle);
    } else if (format === 'markdown') {
      exportToMarkdown(title, studySet, cleanTitle);
    } else if (format === 'pdf') {
      exportToPDF(title, studySet);
    }
  };

  // Rendering logic based on active tab
  const renderContent = () => {
    switch (activeSubTab) {
      case 'summary':
        const summary = studySet.summary || { summaryPoints: [], coreTakeaways: [] };
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Bullet Points */}
            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '14px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} /> High-Impact Summary
              </h3>
              <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {summary.summaryPoints?.map((pt, i) => (
                  <li key={i} style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.6' }}>{pt}</li>
                ))}
                {(!summary.summaryPoints || summary.summaryPoints.length === 0) && (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No summary points generated.</p>
                )}
              </ul>
            </div>

            {/* Core Takeaways */}
            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '14px', color: 'var(--accent-amber)' }}>Core Takeaways</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {summary.coreTakeaways?.map((takeaway, i) => (
                  <div key={i} style={{ 
                    padding: '12px 16px', 
                    borderRadius: 'var(--radius-md)', 
                    backgroundColor: 'var(--bg-surface-hover)',
                    borderLeft: '3px solid var(--accent-amber)',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {takeaway}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'cheat_sheet':
        const cheatSheet = studySet.cheatSheet || [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cheatSheet.length === 0 ? (
              <div className="card text-center"><p>No cheat sheet points generated.</p></div>
            ) : (
              cheatSheet.map((section, idx) => (
                <div key={idx} className="card">
                  <h3 style={{ fontSize: '16px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    {section.title}
                  </h3>
                  <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {section.content?.map((pt, i) => (
                      <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        );

      case 'formulas':
        const formulas = studySet.guide?.formulas || [];
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {formulas.length === 0 ? (
              <div className="card text-center" style={{ gridColumn: '1/-1' }}><p>No formulas found or relevant for this subject.</p></div>
            ) : (
              formulas.map((item, idx) => (
                <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Formula</span>
                  <div style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    padding: '12px', 
                    backgroundColor: 'var(--bg-surface-hover)', 
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    border: '1px solid var(--border-color)',
                    color: 'var(--accent-emerald)'
                  }}>
                    {item.formula}
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '14px', marginTop: '4px' }}>{item.name}</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.explanation}</p>
                </div>
              ))
            )}
          </div>
        );

      case 'mnemonics':
        const mnemonics = studySet.guide?.mnemonics || [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mnemonics.length === 0 ? (
              <div className="card text-center"><p>No mnemonics generated.</p></div>
            ) : (
              mnemonics.map((item, idx) => (
                <div key={idx} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ 
                    padding: '12px 18px', 
                    backgroundColor: 'var(--accent-amber-light)', 
                    color: 'var(--accent-amber)',
                    border: '1px solid var(--accent-amber-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    fontFamily: 'var(--font-mono)',
                    minWidth: '110px',
                    textAlign: 'center'
                  }}>
                    {item.mnemonic.split(' ')[0]}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                      Concept: <strong>{item.concept}</strong>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                      Mnemonic phrase: "{item.mnemonic}"
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'guide':
        const guide = studySet.guide || { summary: '', keyConcepts: [] };
        const totalItems = guide.keyConcepts?.length || 0;
        const checkedPercent = totalItems > 0 ? Math.round((checkedGuideItems.size / totalItems) * 100) : 0;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px' }}>Module Syllabus Checklist</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Check concepts off as you master them.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '100px', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${checkedPercent}%`, height: '100%', backgroundColor: 'var(--accent-emerald)' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{checkedPercent}%</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {guide.keyConcepts?.map((concept, idx) => (
                <div key={idx} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <button 
                    onClick={() => handleToggleGuideItem(idx)}
                    style={{ 
                      background: 'none', 
                      border: 0, 
                      padding: 0, 
                      cursor: 'pointer', 
                      color: checkedGuideItems.has(idx) ? 'var(--accent-emerald)' : 'var(--text-muted)' 
                    }}
                  >
                    <CheckSquare size={20} fill={checkedGuideItems.has(idx) ? 'currentColor' : 'none'} />
                  </button>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      fontSize: '15px', 
                      fontWeight: '600',
                      textDecoration: checkedGuideItems.has(idx) ? 'line-through' : 'none',
                      color: checkedGuideItems.has(idx) ? 'var(--text-muted)' : 'var(--text-primary)'
                    }}>
                      {concept.concept}
                    </h4>
                    <p style={{ 
                      fontSize: '13px', 
                      marginTop: '6px', 
                      color: checkedGuideItems.has(idx) ? 'var(--text-muted)' : 'var(--text-secondary)'
                    }}>
                      {concept.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // ==========================================
      // NEW DYNAMIC SUBJECT SPECIFIC RENDERERS
      // ==========================================

      case 'programming_examples':
        const prog = studySet.subjectResources?.programming || {};
        const codeExamples = prog.codeExamples || [];
        const complexityAnalysis = prog.complexityAnalysis || [];
        const debuggingChallenges = prog.debuggingChallenges || [];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Code size={18} style={{ color: 'var(--accent-emerald)' }} /> Interactive Code Reference
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {codeExamples.map((ex, idx) => (
                  <div key={idx} style={{ padding: '14px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>{ex.title}</h4>
                    <pre style={{ margin: 0, padding: '12px', backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflowX: 'auto', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-emerald)' }}>
                      <code>{ex.code}</code>
                    </pre>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: 0 }}>{ex.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Complexity Profiles</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {complexityAnalysis.map((c, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <strong>{c.concept}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{c.explanation}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      <span style={{ color: 'var(--accent-emerald)' }}>Time: {c.timeComplexity}</span>
                      <br />
                      <span style={{ color: 'var(--accent-amber)' }}>Space: {c.spaceComplexity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'math_solutions':
        const math = studySet.subjectResources?.mathematics || {};
        const stepByStepSolutions = math.stepByStepSolutions || [];
        const commonMistakes = math.commonMistakes || [];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={18} style={{ color: 'var(--accent-emerald)' }} /> Step-by-Step Problem Solver
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {stepByStepSolutions.map((sol, idx) => (
                  <div key={idx} style={{ padding: '16px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>Problem: {sol.problem}</div>
                    <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {sol.steps?.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                    <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'inline-block' }}>
                      Final Answer: <strong style={{ color: 'var(--accent-emerald)' }}>{sol.finalAnswer}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber)' }}>
                <AlertOctagon size={18} /> Common Pitfalls
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {commonMistakes.map((m, idx) => (
                  <div key={idx} style={{ padding: '14px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <strong style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>{m.concept}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--accent-red)' }}>Mistake: {m.mistake}</div>
                    <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '4px' }}>Correction: {m.correction}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'biology_processes':
        const bio = studySet.subjectResources?.biology || {};
        const keyProcesses = bio.keyProcesses || [];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {keyProcesses.map((proc, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--accent-emerald)' }}>
                  Process: {proc.processName}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '12px', borderLeft: '2px solid var(--border-color)' }}>
                  {proc.steps?.map((step, sIdx) => (
                    <div key={sIdx} style={{ fontSize: '13px', display: 'flex', gap: '10px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--accent-emerald)' }}>{sIdx + 1}.</span>
                      <span style={{ color: 'var(--text-primary)' }}>{step}</span>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Significance: {proc.significance}
                </div>
              </div>
            ))}
          </div>
        );

      case 'history_timeline':
        const hist = studySet.subjectResources?.history || {};
        const timeline = hist.timeline || [];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={18} style={{ color: 'var(--accent-emerald)' }} /> Chronological Timeline
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px', borderLeft: '2px solid var(--border-color)' }}>
                {timeline.map((item, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    {/* Circle Node */}
                    <div style={{
                      position: 'absolute',
                      left: '-26px',
                      top: '2px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-emerald)',
                      border: '2px solid var(--bg-surface)'
                    }} />

                    <div>
                      <strong style={{ color: 'var(--accent-emerald)', fontSize: '14px' }}>{item.year}</strong>
                      <div style={{ fontWeight: 'bold', fontSize: '13px', marginTop: '2px' }}>{item.event}</div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>{item.significance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'language_vocabulary':
        const lang = studySet.subjectResources?.languages || {};
        const vocabulary = lang.vocabulary || [];

        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {vocabulary.map((voc, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '16px', color: 'var(--accent-emerald)' }}>{voc.word}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{voc.pronunciation}</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '2px' }}>Translation: {voc.translation}</div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0, marginTop: '4px' }}>
                  Usage: "{voc.usage}"
                </p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Export Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={() => handleExport('json')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
          <Download size={12} /> JSON
        </button>
        <button onClick={() => handleExport('markdown')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
          <Download size={12} /> Markdown
        </button>
        <button onClick={() => handleExport('pdf')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
          <Download size={12} /> PDF Print
        </button>
      </div>

      {/* Main Content Render */}
      <div>
        {renderContent()}
      </div>

      {/* Refinement Loop Footer Input */}
      <div className="card" style={{ marginTop: '20px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} style={{ color: 'var(--accent-emerald)' }} /> Refinement loop
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Provide feedback or instructions (e.g. "Add a mnemonic for DNS", "Expand on section 2") to update this study set.
        </p>

        <form onSubmit={handleRefineSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Type refinement instructions..."
            value={refinePrompt}
            onChange={(e) => setRefinePrompt(e.target.value)}
            disabled={isRefining}
            style={{ flex: 1, fontSize: '13px' }}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!refinePrompt.trim() || isRefining}
            style={{ padding: '8px 16px' }}
          >
            {isRefining ? 'Updating...' : <><Send size={12} /> Refine</>}
          </button>
        </form>
      </div>

    </div>
  );
}
export default GuideView;
