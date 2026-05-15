import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../firebase.js';

function timeAgo(timestamp) {
  if (!timestamp) return 'now';
  const s = Math.floor((Date.now() - timestamp.toMillis()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
}

export default function CommentSheet({ post, onClose }) {
  const [comments, setComments] = useState(post.comments || []);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!post.id) return;
    const q = query(collection(db, 'posts', post.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.docs.length > 0) {
        setComments(snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          timeAgo: d.data().createdAt ? timeAgo(d.data().createdAt) : 'now',
        })));
      }
    });
    return unsub;
  }, [post.id]);

  async function handleSend() {
    if (!text.trim()) return;
    const user = auth.currentUser;
    const commentText = text.trim();
    setText('');
    try {
      await addDoc(collection(db, 'posts', post.id, 'comments'), {
        userId: user?.uid || 'anon',
        username: user?.displayName?.toLowerCase().replace(/\s+/g, '.') || 'you',
        avatar: user?.photoURL || '',
        text: commentText,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'posts', post.id), { commentCount: increment(1) });
      if (user && post.userId && post.userId !== user.uid) {
        await addDoc(collection(db, 'users', post.userId, 'notifications'), {
          type: 'comment',
          fromUid: user.uid,
          fromUsername: user.displayName?.toLowerCase().replace(/\s+/g, '.') || 'someone',
          fromAvatar: user.photoURL || '',
          text: `commented: "${commentText.length > 40 ? commentText.slice(0, 40) + '…' : commentText}"`,
          postId: post.id,
          unread: true,
          createdAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.error('comment failed:', e);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet comment-sheet">
        <div className="modal-header">
          <h2 className="modal-title">comments</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="comment-list">
          {comments.length === 0 && (
            <p className="comment-empty">no comments yet. be the first!</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="comment-row">
              {c.avatar
                ? <img src={c.avatar} alt={c.username} className="comment-avatar" referrerPolicy="no-referrer" />
                : <div className="comment-avatar comment-avatar--initials">{(c.username || 'u')[0].toUpperCase()}</div>
              }
              <div className="comment-body">
                <span className="comment-username">{c.username}</span>
                <span className="comment-text">{c.text}</span>
              </div>
              <span className="comment-time">{c.timeAgo}</span>
            </div>
          ))}
        </div>

        <div className="comment-input-row">
          {auth.currentUser?.photoURL
            ? <img src={auth.currentUser.photoURL} alt="you" className="comment-avatar" referrerPolicy="no-referrer" />
            : <div className="comment-avatar comment-avatar--initials">{(auth.currentUser?.displayName || 'y')[0].toUpperCase()}</div>
          }
          <input
            className="comment-input"
            placeholder="add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="comment-send" onClick={handleSend} disabled={!text.trim()}>send</button>
        </div>
      </div>
    </div>
  );
}
