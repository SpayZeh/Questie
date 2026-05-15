import React, { useState } from 'react';

const mockNotifs = [
  { id: 1, avatar: 'https://i.pravatar.cc/150?img=12', text: 'joel.g reacted 🌿 to your quest', timeAgo: '2m', unread: true },
  { id: 2, avatar: 'https://i.pravatar.cc/150?img=47', text: 'irene.daily added you as a questie', timeAgo: '8m', unread: true },
  { id: 3, avatar: 'https://i.pravatar.cc/150?img=32', text: 'soph.snaps reacted ❤️ to your quest', timeAgo: '21m', unread: true },
  { id: 4, avatar: 'https://i.pravatar.cc/150?img=15', text: 'marcus.out added you as a questie', timeAgo: '1h', unread: false },
  { id: 5, avatar: 'https://i.pravatar.cc/150?img=60', text: 'dana.clicks reacted 😂 to your quest', timeAgo: '3h', unread: false },
  { id: 6, avatar: 'https://i.pravatar.cc/150?img=22', text: 'leon.w added you as a questie', timeAgo: '5h', unread: false },
];

export default function NotifSheet({ onClose }) {
  const [notifs, setNotifs] = useState(mockNotifs);

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  const hasUnread = notifs.some((n) => n.unread);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet notif-sheet">
        <div className="modal-header">
          <h2 className="modal-title">notifications</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {hasUnread && (
              <button className="notif-mark-read" onClick={markAllRead}>mark all read</button>
            )}
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="notif-list">
          {notifs.map((n) => (
            <div key={n.id} className={`notif-row${n.unread ? ' notif-row--unread' : ''}`}>
              <img src={n.avatar} alt="" className="comment-avatar" />
              <p className="notif-text">{n.text}</p>
              <span className="comment-time">{n.timeAgo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
