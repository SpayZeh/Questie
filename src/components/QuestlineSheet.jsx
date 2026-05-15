import React from 'react';

export default function QuestlineSheet({ questline = [], onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet questline-sheet">
        <div className="modal-header">
          <h2 className="modal-title">my questline</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {questline.length === 0 && (
          <p className="comment-empty">complete your first quest to start your questline!</p>
        )}

        <div className="questline-timeline">
          <div className="questline-line" />
          {questline.map((item, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={item.id} className={`questline-item ${isLeft ? 'questline-item--left' : 'questline-item--right'}`}>
                <p className="questline-quest">{item.quest}</p>
                <img src={item.photo} alt={item.quest} className="questline-photo" loading="lazy" />
                {item.caption && <p className="questline-caption">{item.caption}</p>}
                <p className="questline-date">{item.date} · {item.time}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
