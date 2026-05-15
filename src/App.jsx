import React, { useState, useEffect } from 'react';
import FeedPost from './components/FeedPost.jsx';
import PostModal from './components/PostModal.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import { friendPosts, discoveryPosts } from './data/posts.js';
import { msUntilReset } from './data/quests.js';

const quest = { emoji: '🌿', tagline: 'Touch Grass', description: 'Literally, touch grass and capture it.', color: '#F97316' };

function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600).toString().padStart(2, '0');
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function App() {
  const [tab, setTab] = useState('best');
  const [showPost, setShowPost] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [msLeft, setMsLeft] = useState(msUntilReset());

  useEffect(() => {
    const id = setInterval(() => setMsLeft(msUntilReset()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="app">
      <div className="app-inner">

        <header className="quest-bar">
          <div className="quest-timer-pill">{formatCountdown(msLeft)}</div>
          <p className="quest-tagline"><span className="quest-emoji">{quest.emoji}</span> {quest.tagline}</p>
          <p className="quest-desc">{quest.description}</p>
          <button className="quest-post-btn" onClick={() => setShowPost(true)}>
            Complete Quest
          </button>
        </header>

        {/* Global tab action bar */}
        {tab === 'potential' && (
          <div className="global-action-bar">
            <span className="global-action-label">explore questies</span>
            <button className="global-add-btn" onClick={() => setShowProfile(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
              add questie
            </button>
          </div>
        )}

        <main className="feed">
          {(tab === 'best' ? friendPosts : discoveryPosts).map((post) => (
            <FeedPost key={post.id} post={post} questEmoji={quest.emoji} />
          ))}
        </main>

      </div>

      <nav className="bottom-nav">
        <button className={`bottom-tab ${tab === 'best' ? 'bottom-tab--active' : ''}`} onClick={() => setTab('best')}>
          my best questies
        </button>
        <button className="bottom-profile-btn" onClick={() => setShowProfile(true)}>
          <img src="https://i.pravatar.cc/150?img=5" alt="Profile" className="bottom-profile-avatar" />
        </button>
        <button className={`bottom-tab ${tab === 'potential' ? 'bottom-tab--active' : ''}`} onClick={() => setTab('potential')}>
          future questies
        </button>
      </nav>

      {showPost    && <PostModal    quest={quest} onClose={() => setShowPost(false)} />}
      {showProfile && <ProfileModal              onClose={() => setShowProfile(false)} />}
    </div>
  );
}
