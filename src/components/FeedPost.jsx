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
        <div className="post-reactions">
          {reactions.map((r) => (
            <button
              key={r.emoji}
              className={`reaction-btn${tapped[r.emoji] ? ' reaction-btn--tapped' : ''}`}
              onClick={() => handleReaction(r.emoji)}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
