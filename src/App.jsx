import React, { useState } from 'react';
import FeedPost from './components/FeedPost.jsx';
import PostModal from './components/PostModal.jsx';
import { friendPosts, discoveryPosts } from './data/posts.js';

const quest = { emoji: '🌿', tagline: 'Touch Grass', description: 'Literally, touch grass and capture it.', color: '#34C759' };

export default function App() {
  const [tab, setTab] = useState('best');
  const [showPost, setShowPost] = useState(false);

  return (
    <div className="app">
      <div className="app-inner">

        <header className="quest-bar" style={{ '--qcolor': quest.color }}>
          <div className="quest-bar-inner">
            <span className="quest-emoji">{quest.emoji}</span>
            <div className="quest-text">
              <span className="quest-tagline">{quest.tagline}</span>
              <span className="quest-desc">{quest.description}</span>
            </div>
            <button className="quest-post-btn" onClick={() => setShowPost(true)}>
              Complete Quest
            </button>
          </div>
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
