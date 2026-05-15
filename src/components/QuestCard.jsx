import React, { useRef, useState } from 'react';

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

export default function QuestCard({ quest, nextQuest, onComplete }) {
  const fileInputRef = useRef(null);
  const [completed, setCompleted] = useState(false);
  const [preview, setPreview] = useState(null);

  function handleCompleteClick() {
    fileInputRef.current.click();
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setCompleted(true);
    if (onComplete) onComplete(url);
  }

  return (
    <div
      className="quest-card"
      style={{
        '--quest-color': quest.color,
        '--quest-color-light': quest.colorLight,
        '--quest-color-mid': quest.colorMid,
      }}
    >
      <div className="quest-card-inner">
        {/* Top badge */}
        <div className="quest-badge">
          <span className="quest-badge-dot" />
          TODAY'S QUEST
        </div>

        {/* Quest title */}
        <div className="quest-emoji-big">{quest.emoji}</div>
        <h2 className="quest-title">{quest.title}</h2>
        <p className="quest-description">{quest.description}</p>

        {/* Completion stats */}
        <div className="quest-stats">
          <span className="quest-stats-icon">👥</span>
          <span className="quest-stats-text">
            <strong>{formatNumber(quest.completions)}</strong> people completed today
          </span>
        </div>

        {/* Complete button or completed state */}
        {completed ? (
          <div className="quest-completed">
            <div className="quest-completed-preview">
              <img src={preview} alt="Your quest completion" className="quest-preview-img" />
              <div className="quest-completed-overlay">
                <span className="quest-completed-check">✓</span>
              </div>
            </div>
            <div className="quest-completed-text">
              <p className="quest-completed-title">Quest completed! 🎉</p>
              <p className="quest-completed-sub">Your post is being shared with the world</p>
            </div>
          </div>
        ) : (
          <>
            <button className="complete-btn" onClick={handleCompleteClick}>
              <span className="complete-btn-icon">📸</span>
              Complete Quest
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </>
        )}
      </div>

      {/* Next quest teaser */}
      {nextQuest && (
        <div className="next-quest">
          <span className="next-quest-label">Next up</span>
          <span className="next-quest-title">
            {nextQuest.emoji} {nextQuest.title}
          </span>
        </div>
      )}
    </div>
  );
}
