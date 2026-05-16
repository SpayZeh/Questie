import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

function timeAgo(timestamp) {
  if (!timestamp) return 'just now';
  const seconds = Math.floor((Date.now() - timestamp.toMillis()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export default function NotifSheet({ user, onClose }) {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      setNotifs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  async function markAllRead() {
    if (!user) return;
    await Promise.all(
      notifs
        .filter((n) => n.unread)
        .map((n) => updateDoc(doc(db, 'users', user.uid, 'notifications', n.id), { unread: false }))
    );
  }

  async function respond(notif, accepted) {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'notifications', notif.id), {
      status: accepted ? 'accepted' : 'declined',
      unread: false,
    });
    if (accepted && notif.fromUid) {
      try {
        await updateDoc(doc(db, 'friendRequests', notif.requestId), { status: 'accepted' });
      } catch {}
      await updateDoc(doc(db, 'users', user.uid), { following: arrayUnion(notif.fromUid) });
      await updateDoc(doc(db, 'users', notif.fromUid), { following: arrayUnion(user.uid) });
      await addDoc(collection(db, 'users', notif.fromUid, 'notifications'), {
        type: 'accepted',
        fromUid: user.uid,
        fromUsername: auth.currentUser?.displayName || 'someone',
        fromAvatar: auth.currentUser?.photoURL || '',
        text: 'accepted your questie request',
        unread: true,
        pushed: false,
        createdAt: serverTimestamp(),
      });
    } else if (!accepted && notif.requestId) {
      try {
        await updateDoc(doc(db, 'friendRequests', notif.requestId), { status: 'declined' });
      } catch {}
    }
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
          {notifs.length === 0 && (
            <p className="comment-empty">no notifications yet.</p>
          )}
          {notifs.map((n) => (
            <div key={n.id} className={`notif-row${n.unread ? ' notif-row--unread' : ''}`}>
              {n.fromAvatar
                ? <img src={n.fromAvatar} alt={n.fromUsername} className="comment-avatar" referrerPolicy="no-referrer" />
                : <div className="comment-avatar post-avatar--initials">{(n.fromUsername || 'u')[0].toUpperCase()}</div>
              }
              <div className="notif-body">
                <p className="notif-text"><strong>{n.fromUsername}</strong> {n.text}</p>
                {n.type === 'request' && !n.status && (
                  <div className="notif-actions">
                    <button className="notif-btn notif-btn--accept" onClick={() => respond(n, true)}>accept</button>
                    <button className="notif-btn notif-btn--decline" onClick={() => respond(n, false)}>decline</button>
                  </div>
                )}
                {n.status && (
                  <span className="notif-status">{n.status === 'accepted' ? 'added as questie' : 'declined'}</span>
                )}
              </div>
              <span className="comment-time">{n.createdAt ? timeAgo(n.createdAt) : 'just now'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
