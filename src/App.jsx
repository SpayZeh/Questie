import React, { useState } from 'react';
import FeedPost from './components/FeedPost.jsx';
import QuestBanner from './components/QuestBanner.jsx';
import { getTodaysQuest, getNextQuest } from './data/quests.js';
import { feedPosts } from './data/posts.js';

const todaysQuest = getTodaysQuest();
const nextQuest = getNextQuest();

export default function App() {
  const [tab, setTab] = useState('best');

  return (
    <div className="app">
      <div className="app-inner">

        <header className="header">
          <nav className="tabs">
            <button
              className={`tab ${tab === 'best' ? 'tab--active' : ''}`}
              onClick={() => setTab('best')}
            >
              Best Questies
            </button>
            <button
              className={`tab ${tab === 'potential' ? 'tab--active' : ''}`}
              onClick={() => setTab('potential')}
            >
              Potential Questies
            </button>
          </nav>
          <button className="profile-btn">
            <img
              src="https://i.pravatar.cc/150?img=5"
              alt="Profile"
              className="profile-avatar"
            />
            <span className="profile-label">Profile</span>
          </button>
        </header>

        <QuestBanner quest={todaysQuest} nextQuest={nextQuest} />

        <main className="feed">
          {feedPosts.map((post) => (
            <FeedPost key={post.id} post={post} />
          ))}
        </main>

      </div>
    </div>
  );
}
