import React, { useState, useEffect } from 'react';
import FeedPost from './components/FeedPost.jsx';
import PostModal from './components/PostModal.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import { friendPosts as initialFriendPosts, discoveryPosts } from './data/posts.js';
import { msUntilReset } from './data/quests.js';

const quest = { emoji: '🌿', tagline: 'Touch Grass', description: 'literally, touch grass and capture it.', color: '#F97316' };

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
  const [friendPosts, setFriendPosts] = useState(initialFriendPosts);
  const [hasPosted, setHasPosted] = useState(false);

  function handlePost(photo, caption) {
    const newPost = {
      id: Date.now(),
      username: 'you',
      avatar: 'https://i.pravatar.cc/150?img=5',
      photo,
      caption,
      timeAgo: '',
      isNew: true,
      reactions: { quest: 0, heart: 0, laugh: 0 },
      comments: [],
    };
    setFriendPosts((prev) => [newPost, ...prev]);
    setHasPosted(true);
    setTab('best');
    setShowPost(false);
  }

  useEffect(() => {
    const id = setInterval(() => setMsLeft(msUntilReset()), 1000);
    return () => clearInterval(id);
  }, []);

  const isFuture = tab === 'potential';

  return (
    <div className="app">
      <div className="app-inner">

        <header className={`quest-bar${hasPosted ? ' quest-bar--done' : ''}`}>
          <div className="quest-bar-top">
            <div className="quest-timer-pill">{formatCountdown(msLeft)}</div>
            <p className="quest-tagline"><span className="quest-emoji">{quest.emoji}</span> {quest.tagline}</p>
            <p className="quest-desc">{quest.description}</p>
          </div>
          {!hasPosted && (
            <button className="quest-post-btn" onClick={() => setShowPost(true)}>
              complete quest
            </button>
          )}
        </header>


        <main className="feed">
          {(isFuture ? discoveryPosts : friendPosts).map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              questEmoji={quest.emoji}
              showAddQuestie={isFuture}
            />
          ))}
        </main>

      </div>

      <nav className="bottom-nav">
        <button className={`bottom-tab ${tab === 'best' ? 'bottom-tab--active' : ''}`} onClick={() => setTab('best')}>
          my best questies
        </button>
        <button className="bottom-profile-btn" onClick={() => setShowProfile(true)}>
          <img src="https://i.pravatar.cc/150?img=5" alt="profile" className="bottom-profile-avatar" />
          <span className="bottom-profile-label">you and your questies</span>
        </button>
        <button className={`bottom-tab ${tab === 'potential' ? 'bottom-tab--active' : ''}`} onClick={() => setTab('potential')}>
          future questies
        </button>
      </nav>

      {showPost    && <PostModal    quest={quest} onPost={handlePost} onClose={() => setShowPost(false)} />}
      {showProfile && <ProfileModal              onClose={() => setShowProfile(false)} />}
    </div>
  );
}
