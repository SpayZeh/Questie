import React, { useState } from 'react';

export default function CommentSheet({ post, onClose }) {
  const [comments, setComments] = useState(post.comments);
  const [text, setText] = useState('');

  function handleSend() {
    if (!text.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: Date.now(), username: 'you', avatar: 'https://i.pravatar.cc/150?img=5', text: text.trim(), timeAgo: 'now' },
    ]);
    setText('');
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet comment-sheet">
        <div className="modal-header">
          <h2 className="modal-title">Comments</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="comment-list">
          {comments.length === 0 && (
            <p className="comment-empty">No comments yet. Be the first!</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="comment-row">
              <img src={c.avatar} alt={c.username} className="comment-avatar" />
              <div className="comment-body">
                <span className="comment-username">{c.username}</span>
                <span className="comment-text">{c.text}</span>
              </div>
              <span className="comment-time">{c.timeAgo}</span>
            </div>
          ))}
        </div>

        <div className="comment-input-row">
          <img src="https://i.pravatar.cc/150?img=5" alt="you" className="comment-avatar" />
          <input
            className="comment-input"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="comment-send" onClick={handleSend} disabled={!text.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
}
