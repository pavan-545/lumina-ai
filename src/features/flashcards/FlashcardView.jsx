import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, Star, CheckCircle, RotateCw, ChevronLeft, ChevronRight, HelpCircle, Lightbulb, Keyboard
} from 'lucide-react';

export function FlashcardView({ 
  flashcards = [], 
  onMarkMastered, // callback to update stats/state
  onMarkNeedsPractice
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'mastered', 'practice', 'starred', 'bookmarked'
  
  // Custom states that extend the cards on client side
  const [starredIds, setStarredIds] = useState(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [masteredIds, setMasteredIds] = useState(new Set());
  const [needsPracticeIds, setNeedsPracticeIds] = useState(new Set());
  
  // Drawer states
  const [showELI10, setShowELI10] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const containerRef = useRef(null);

  // Filter flashcards list
  const filteredCards = flashcards.filter((card, idx) => {
    if (filter === 'mastered') return masteredIds.has(idx);
    if (filter === 'practice') return needsPracticeIds.has(idx);
    if (filter === 'starred') return starredIds.has(idx);
    if (filter === 'bookmarked') return bookmarkedIds.has(idx);
    return true;
  });

  const activeCard = filteredCards[currentIndex];

  // Handle index boundaries
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(Math.max(0, filteredCards.length - 1));
    }
  }, [filteredCards.length, currentIndex]);

  // Keyboard Navigation Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't fire hotkeys if user is focusing an input field
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setIsFlipped(prev => !prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (activeCard) handleToggleMastered();
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (activeCard) handleTogglePractice();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredCards.length, activeCard, masteredIds, needsPracticeIds]);

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowELI10(false);
    setShowExample(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowELI10(false);
    setShowExample(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleToggleStar = (e) => {
    e.stopPropagation();
    const newStarred = new Set(starredIds);
    if (newStarred.has(currentIndex)) {
      newStarred.delete(currentIndex);
    } else {
      newStarred.add(currentIndex);
    }
    setStarredIds(newStarred);
  };

  const handleToggleBookmark = (e) => {
    e.stopPropagation();
    const newBookmarked = new Set(bookmarkedIds);
    if (newBookmarked.has(currentIndex)) {
      newBookmarked.delete(currentIndex);
    } else {
      newBookmarked.add(currentIndex);
    }
    setBookmarkedIds(newBookmarked);
  };

  const handleToggleMastered = (e) => {
    if (e) e.stopPropagation();
    const newMastered = new Set(masteredIds);
    const newPractice = new Set(needsPracticeIds);
    
    if (newMastered.has(currentIndex)) {
      newMastered.delete(currentIndex);
    } else {
      newMastered.add(currentIndex);
      newPractice.delete(currentIndex); // Mutually exclusive
      if (onMarkMastered) onMarkMastered();
    }
    
    setMasteredIds(newMastered);
    setNeedsPracticeIds(newPractice);
  };

  const handleTogglePractice = (e) => {
    if (e) e.stopPropagation();
    const newMastered = new Set(masteredIds);
    const newPractice = new Set(needsPracticeIds);
    
    if (newPractice.has(currentIndex)) {
      newPractice.delete(currentIndex);
    } else {
      newPractice.add(currentIndex);
      newMastered.delete(currentIndex); // Mutually exclusive
      if (onMarkNeedsPractice) onMarkNeedsPractice();
    }
    
    setMasteredIds(newMastered);
    setNeedsPracticeIds(newPractice);
  };

  if (flashcards.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '60px 24px' }}>
        <p>No flashcards generated for this set.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px', margin: '0 auto' }}>
      
      {/* Filtering Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'mastered', 'practice', 'starred', 'bookmarked'].map((t) => (
            <button
              key={t}
              onClick={() => { setFilter(t); setCurrentIndex(0); setIsFlipped(false); }}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: filter === t ? 'var(--accent-emerald-light)' : 'var(--bg-surface)',
                borderColor: filter === t ? 'var(--accent-emerald)' : 'var(--border-color)',
                color: filter === t ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Keyboard helpers indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <Keyboard size={13} />
          <span>Hotkeys active</span>
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="card" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <p>No cards match the current filter selection.</p>
        </div>
      ) : (
        <>
          {/* Card Frame */}
          <div 
            ref={containerRef}
            className={`flashcard-container ${isFlipped ? 'flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
            tabIndex={0}
          >
            <div className="flashcard-inner">
              
              {/* CARD FRONT: QUESTION */}
              <div className="flashcard-front">
                {/* Header indicators */}
                <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    padding: '3px 8px', 
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: activeCard.difficulty === 'hard' ? 'var(--accent-red-light)' : activeCard.difficulty === 'medium' ? 'var(--accent-amber-light)' : 'var(--accent-emerald-light)',
                    color: activeCard.difficulty === 'hard' ? 'var(--accent-red)' : activeCard.difficulty === 'medium' ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                    border: `1px solid ${activeCard.difficulty === 'hard' ? 'var(--accent-red-border)' : activeCard.difficulty === 'medium' ? 'var(--accent-amber-border)' : 'var(--accent-emerald-border)'}`
                  }}>
                    {activeCard.difficulty.toUpperCase()}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleToggleStar} style={{ background: 'none', border: 0, cursor: 'pointer', color: starredIds.has(currentIndex) ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                      <Star size={18} fill={starredIds.has(currentIndex) ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={handleToggleBookmark} style={{ background: 'none', border: 0, cursor: 'pointer', color: bookmarkedIds.has(currentIndex) ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                      <Bookmark size={18} fill={bookmarkedIds.has(currentIndex) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Question
                  </span>
                  <h3 style={{ fontSize: '20px', lineHeight: '1.4', fontWeight: '500' }}>
                    {activeCard.question}
                  </h3>
                </div>

                <div style={{ position: 'absolute', bottom: '24px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  <RotateCw size={12} />
                  <span>Click or press Space to Flip</span>
                </div>
              </div>

              {/* CARD BACK: ANSWER */}
              <div className="flashcard-back">
                {/* Header indicators */}
                <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: '600' }}>
                    ANSWER SIDE
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={handleToggleMastered}
                      className="btn"
                      style={{ 
                        padding: '4px 8px', 
                        fontSize: '11px', 
                        backgroundColor: masteredIds.has(currentIndex) ? 'var(--accent-emerald)' : 'var(--bg-surface)',
                        color: masteredIds.has(currentIndex) ? 'var(--bg-base)' : 'var(--text-primary)',
                        borderColor: 'var(--accent-emerald)',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      Mastered
                    </button>
                    <button 
                      onClick={handleTogglePractice}
                      className="btn"
                      style={{ 
                        padding: '4px 8px', 
                        fontSize: '11px', 
                        backgroundColor: needsPracticeIds.has(currentIndex) ? 'var(--accent-amber)' : 'var(--bg-surface)',
                        color: needsPracticeIds.has(currentIndex) ? 'var(--bg-base)' : 'var(--text-primary)',
                        borderColor: 'var(--accent-amber)',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      Needs Practice
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 10px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '400', lineHeight: '1.5' }}>
                    {activeCard.answer}
                  </h3>
                </div>

                {/* Sub-drawers togglers */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: '20px', 
                  left: '20px', 
                  right: '20px', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '12px' 
                }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowELI10(!showELI10); setShowExample(false); }}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                  >
                    <HelpCircle size={12} /> ELI10
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowExample(!showExample); setShowELI10(false); }}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                  >
                    <Lightbulb size={12} /> Real Example
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Sub-drawer Content Display */}
          <AnimatePresence>
            {(showELI10 && isFlipped) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="card"
                style={{ backgroundColor: 'var(--bg-surface-hover)', borderColor: 'var(--accent-emerald-border)', padding: '16px', overflow: 'hidden' }}
              >
                <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <HelpCircle size={14} /> Explain Like I'm 10 (Analogy)
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{activeCard.explainLike10}</p>
              </motion.div>
            )}

            {(showExample && isFlipped) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="card"
                style={{ backgroundColor: 'var(--bg-surface-hover)', borderColor: 'var(--accent-amber-border)', padding: '16px', overflow: 'hidden' }}
              >
                <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Lightbulb size={14} /> Real World Scenario
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{activeCard.realWorldExample}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Player controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <button onClick={handlePrev} className="btn btn-secondary">
              <ChevronLeft size={16} /> Prev
            </button>
            
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              <strong>{currentIndex + 1}</strong> of <strong>{filteredCards.length}</strong>
            </span>
            
            <button onClick={handleNext} className="btn btn-secondary">
              Next <ChevronRight size={16} />
            </button>
          </div>

          {/* Keyboard Shortcuts Guide Drawer */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px', 
            fontSize: '11px', 
            color: 'var(--text-muted)',
            marginTop: '8px'
          }}>
            <span><kbd className="kbd-badge">Space</kbd> Flip</span>
            <span><kbd className="kbd-badge">&larr;</kbd> <kbd className="kbd-badge">&rarr;</kbd> Prev/Next</span>
            <span><kbd className="kbd-badge">&uarr;</kbd> Mastered</span>
            <span><kbd className="kbd-badge">&darr;</kbd> Practice</span>
          </div>
        </>
      )}
    </div>
  );
}
export default FlashcardView;
