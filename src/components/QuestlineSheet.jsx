import React from 'react';

const mockQuestline = [
  { id: 1, quest: 'touch grass',  photo: 'https://picsum.photos/seed/ql-1/400/520', date: 'may 14', time: '12:32pm' },
  { id: 2, quest: "i'm blue",     photo: 'https://picsum.photos/seed/ql-2/400/520', date: 'may 13', time: '3:17pm'  },
  { id: 3, quest: 'new heights',  photo: 'https://picsum.photos/seed/ql-3/400/520', date: 'may 12', time: '9:45am'  },
  { id: 4, quest: 'say cheese',   photo: 'https://picsum.photos/seed/ql-4/400/520', date: 'may 11', time: '6:02pm'  },
  { id: 5, quest: 'golden hour',  photo: 'https://picsum.photos/seed/ql-5/400/520', date: 'may 10', time: '7:48pm'  },
];

export default function QuestlineSheet({ onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet questline-sheet">
        <div className="modal-header">
          <h2 className="modal-title">my questline</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="questline-timeline">
          <div className="questline-line" />
          {mockQuestline.map((item, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={item.id} className={`questline-item ${isLeft ? 'questline-item--left' : 'questline-item--right'}`}>
                <p className="questline-quest">{item.quest}</p>
                <img src={item.photo} alt={item.quest} className="questline-photo" loading="lazy" />
                <p className="questline-date">{item.date} · {item.time}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
