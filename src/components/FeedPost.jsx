import React, { useState } from 'react';

export default function FeedPost({ post, questColor }) {
  const [reactions, setReactions] = useState(post.reactions);
  const [tapped, setTapped] = useState({});

  function handleReaction(emoji) {
    if (tapped[emoji]) return;
    setTapped((prev) => ({ ...prev, [emoji]: true }));
    setReactions((prev) =>
      prev.map((r) =>
        r.emoji === emoji ? { ...r, count: r.count + 1 } : r
      )
    );
  }

  function addNewReaction(emoji) {
    if (tapped[emoji]) return;
    const existing = reactions.find((r) => r.emoji === emoji);
    if (existing) {
      handleReaction(emoji);
    } else {
      setTapped((prev) => ({ ...prev, [emoji]: true }));
      setReactions((prev) => [...prev, { emoji, count: 1 }]);
    }
  }

  return (
    <article className="feed-post">
      {/* Header */}
      <div className="post-header">
        <img src={post.avatar} alt={post.displayName} className="post-avatar" />
        <div className="post-meta">
          <span className="post-display-name">{post.displayName}</span>
          <span className="post-username">@{post.username}</span>
        </div>
        <span className="post-time">{post.timeAgo}</span>
      </div>

      {/* Photo */}
      <div className="post-photo-wrap">
        <img
          src={post.photo}
          alt={`${post.displayName}'s quest completion`}
          className="post-photo"
          loading="lazy"
        />
        <div
          className="post-photo-badge"
          style={{ background: questColor }}
        >
          ✓ Quested
        </div>
      </div>

      {/* Reactions */}
      <div className="post-reactions">
        <div className="reaction-list">
          {reactions.map((r) => (
            <button
              key={r.emoji}
              className={`reaction-btn${tapped[r.emoji] ? ' reaction-btn--active' : ''}`}
              onClick={() => handleReaction(r.emoji)}
              style={tapped[r.emoji] ? { '--quest-color': questColor } : {}}
            >
              {r.emoji} <span className="reaction-count">{r.count}</span>
            </button>
          ))}
        </div>
        <button
          className="add-reaction-btn"
          onClick={() => {
            const emojis = ['😂', '🥹', '💀', '🙌', '✨', '🤩'];
            const pick = emojis[Math.floor(Math.random() * emojis.length)];
            addNewReaction(pick);
          }}
          title="Add reaction"
        >
          +
        </button>
      </div>
    </article>
  );
}
