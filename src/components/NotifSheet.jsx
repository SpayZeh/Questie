import React, { useState } from 'react';

const mockNotifs = [
  { id: 1, type: 'reaction',  avatar: 'https://i.pravatar.cc/150?img=12', username: 'joel.g',      text: 'reacted 🌿 to your quest',   timeAgo: '2m',  unread: true },
  { id: 2, type: 'request',   avatar: 'https://i.pravatar.cc/150?img=47', username: 'irene.daily', text: 'wants to be your questie',    timeAgo: '8m',  unread: true },
  { id: 3, type: 'reaction',  avatar: 'https://i.pravatar.cc/150?img=32', username: 'soph.snaps',  text: 'reacted ❤️ to your quest',   timeAgo: '21m', unread: true },
  { id: 4, type: 'request',   avatar: 'https://i.pravatar.cc/150?img=15', username: 'marcus.out',  text: 'wants to be your questie',    timeAgo: '1h',  unread: false },
  { id: 5, type: 'reaction',  avatar: 'https://i.pravatar.cc/150?img=60', username: 'dana.clicks', text: 'reacted 😂 to your quest',   timeAgo: '3h',  unread: false },
  { id: 6, type: 'request',   avatar: 'https://i.pravatar.cc/150?img=22', username: 'leon.w',      text: 'wants to be your questie',    timeAgo: '5h',  unread: false },
];

export default function NotifSheet({ onClose }) {
  const [notifs, setNotifs] = useState(mockNotifs);

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function respond(id, accepted) {
    setNotifs((prev) => prev.map((n) =>
      n.id === id ? { ...n, status: accepted ? 'accepted' : 'declined', unread: false } : n
    ));
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
              <img src={n.avatar} alt={n.username} className="comment-avatar" />
              <div className="notif-body">
                <p className="notif-text"><strong>{n.username}</strong> {n.text}</p>
                {n.type === 'request' && !n.status && (
                  <div className="notif-actions">
                    <button className="notif-btn notif-btn--accept" onClick={() => respond(n.id, true)}>accept</button>
                    <button className="notif-btn notif-btn--decline" onClick={() => respond(n.id, false)}>decline</button>
                  </div>
                )}
                {n.status && (
                  <span className="notif-status">{n.status === 'accepted' ? '✓ added as questie' : 'declined'}</span>
                )}
              </div>
              <span className="comment-time">{n.timeAgo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
