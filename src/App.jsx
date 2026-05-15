import React, { useState, useRef } from 'react';
import FeedPost from './components/FeedPost.jsx';
import { getTodaysQuest, getNextQuest } from './data/quests.js';
import { feedPosts } from './data/posts.js';

const todaysQuest = getTodaysQuest();
const nextQuest = getNextQuest();

export default function App() {
  const [tab, setTab] = useState('best');
  const fileRef = useRef(null);

  return (
    <div className="app">
      <div className="app-inner">

        {/* Quest bar at top */}
        <div className="quest-bar" style={{ '--qcolor': todaysQuest.color }}>
          <span className="quest-bar-emoji">{todaysQuest.emoji}</span>
          <div className="quest-bar-text">
            <p className="quest-bar-title">{todaysQuest.title}</p>
            <p className="quest-bar-next">Next: {nextQuest.emoji} {nextQuest.title}</p>
          </div>
          <button className="quest-bar-btn" onClick={() => fileRef.current?.click()}>
            Post
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" capture="environment" style={{ display: 'none' }} />
        </div>

        <main className="feed">
          {feedPosts.map((post) => (
            <FeedPost key={post.id} post={post} />
          ))}
        </main>

      </div>

      {/* Bottom nav */}
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
