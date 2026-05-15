import React, { useState, useEffect } from 'react';
import FeedPost from './components/FeedPost.jsx';
import PostModal from './components/PostModal.jsx';
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
  const [msLeft, setMsLeft] = useState(msUntilReset());

  useEffect(() => {
    const id = setInterval(() => setMsLeft(msUntilReset()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="app">
      <div className="app-inner">

        <header className="quest-bar">
          <div className="quest-module-top">
            <span className="quest-emoji">{quest.emoji}</span>
            <div className="quest-timer-pill">{formatCountdown(msLeft)}</div>
          </div>
          <p className="quest-tagline">{quest.tagline}</p>
          <p className="quest-desc">{quest.description}</p>
          <button className="quest-post-btn" onClick={() => setShowPost(true)}>
            Complete Quest
          </button>
        </header>

        <main className="feed">
          {(tab === 'best' ? friendPosts : discoveryPosts).map((post) => (
            <FeedPost key={post.id} post={post} questEmoji={quest.emoji} />
          ))}
        </main>

      </div>

      <nav className="bottom-nav">
        <button className={`bottom-tab ${tab === 'best' ? 'bottom-tab--active' : ''}`} onClick={() => setTab('best')}>
          My Best Questies
        </button>
        <button className="bottom-profile-btn">
          <img src="https://i.pravatar.cc/150?img=5" alt="Profile" className="bottom-profile-avatar" />
        </button>
        <button className={`bottom-tab ${tab === 'potential' ? 'bottom-tab--active' : ''}`} onClick={() => setTab('potential')}>
          Potential Questies
        </button>
      </nav>

      {showPost && <PostModal quest={quest} onClose={() => setShowPost(false)} />}
    </div>
  );
}
