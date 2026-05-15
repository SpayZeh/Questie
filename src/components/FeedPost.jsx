import React, { useState } from 'react';
import CommentSheet from './CommentSheet.jsx';

export default function FeedPost({ post, questEmoji, showAddQuestie }) {
  const [reactions, setReactions] = useState({ ...post.reactions });
  const [tapped, setTapped] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [added, setAdded] = useState(false);

  function tap(key) {
    if (tapped[key]) return;
    setTapped((prev) => ({ ...prev, [key]: true }));
    setReactions((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  }

  const pills = [
    { key: 'quest', emoji: questEmoji },
    { key: 'heart', emoji: '❤️' },
    { key: 'laugh', emoji: '😂' },
  ];

  return (
    <>
      <article className="feed-post">
        <div className="post-header">
          <img src={post.avatar} alt={post.username} className="post-avatar" />
          <div className="post-meta">
            <span className="post-username">{post.username}</span>
            <span className="post-time">{post.isNew ? 'just completed' : post.timeAgo}</span>
          </div>
          {showAddQuestie && (
            <button
              className={`post-add-btn ${added ? 'post-add-btn--done' : ''}`}
              onClick={() => setAdded(true)}
            >
              {added ? (
                '✓ added'
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
                  add questie
                </>
              )}
            </button>
          )}
        </div>

        <div className="post-photo-wrap">
          <img src={post.photo} alt="" className="post-photo" loading="lazy" />
        </div>

        <div className="post-footer">
          <div className="post-actions">
            <div className="post-reactions">
              {pills.map(({ key, emoji }) => (
                <button
                  key={key}
                  className={`reaction-btn${tapped[key] ? ' reaction-btn--tapped' : ''}`}
                  onClick={() => tap(key)}
                >
                  {emoji} <span className="reaction-count">{reactions[key]}</span>
                </button>
              ))}
              <button className="comment-btn" onClick={() => setShowComments(true)} aria-label="comment">
                <svg className="comment-icon" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            </div>
          </div>

          {post.caption && (
            <p className="post-caption">
              <span className="post-caption-user">{post.username}</span> {post.caption}
            </p>
          )}

          {post.comments.length > 0 && (
            <button className="view-comments" onClick={() => setShowComments(true)}>
              view all {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </article>

      {showComments && <CommentSheet post={post} onClose={() => setShowComments(false)} />}
    </>
  );
}
