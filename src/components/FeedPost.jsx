import React, { useState } from 'react';

export default function FeedPost({ post }) {
  const [reactions, setReactions] = useState(post.reactions);
  const [tapped, setTapped] = useState({});

  function handleReaction(emoji) {
    if (tapped[emoji]) return;
    setTapped((prev) => ({ ...prev, [emoji]: true }));
    setReactions((prev) =>
      prev.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r))
    );
  }

  return (
    <article className="feed-post">
      <div className="post-header">
        <img src={post.avatar} alt={post.username} className="post-avatar" />
        <div className="post-meta">
          <span className="post-username">{post.username}</span>
          <span className="post-time">{post.timeAgo}</span>
        </div>
        {post.isNew && <span className="post-new-badge">New!</span>}
      </div>

      <div className="post-photo-wrap">
        <img src={post.photo} alt="" className="post-photo" loading="lazy" />
      </div>

      <div className="post-footer">
        {post.caption && <p className="post-caption">{post.caption}</p>}

        <div className="post-actions">
          <div className="post-reactions">
            {reactions.map((r) => (
              <button
                key={r.emoji}
                className={`reaction-btn${tapped[r.emoji] ? ' reaction-btn--tapped' : ''}`}
                onClick={() => handleReaction(r.emoji)}
              >
                {r.emoji}
                <span className="reaction-count">{r.count}</span>
              </button>
            ))}
          </div>

          <button className="comment-btn" aria-label="Comment">
            <svg className="comment-icon" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
