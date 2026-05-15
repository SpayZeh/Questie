import React, { useState, useRef } from 'react';
import FeedPost from './components/FeedPost.jsx';
import { getTodaysQuest } from './data/quests.js';
import { feedPosts } from './data/posts.js';

const todaysQuest = getTodaysQuest();

export default function App() {
  const [tab, setTab] = useState('best');
  const fileRef = useRef(null);

  return (
    <div className="app">
      <div className="app-inner">

        <header className="quest-bar" style={{ '--qcolor': todaysQuest.color }}>
          <p className="quest-bar-label">Today's Quest</p>
          <p className="quest-bar-title">{todaysQuest.emoji} {todaysQuest.title}</p>
          <button className="quest-bar-btn" onClick={() => fileRef.current?.click()}>
            Complete Quest
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" capture="environment" style={{ display: 'none' }} />
        </header>

        <main className="feed">
          {feedPosts.map((post) => (
            <FeedPost key={post.id} post={post} />
          ))}
        </main>

      </div>

      <nav className="bottom-nav">
        <button
          className={`bottom-tab ${tab === 'best' ? 'bottom-tab--active' : ''}`}
          onClick={() => setTab('best')}
        >
          My Best Questies
        </button>
        <button className="bottom-profile-btn">
          <img src="https://i.pravatar.cc/150?img=5" alt="Profile" className="bottom-profile-avatar" />
        </button>
        <button
          className={`bottom-tab ${tab === 'potential' ? 'bottom-tab--active' : ''}`}
          onClick={() => setTab('potential')}
        >
          Potential Questies
        </button>
      </nav>

    </div>
  );
}
