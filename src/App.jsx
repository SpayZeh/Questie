import React, { useState, useEffect } from 'react';
import FeedPost from './components/FeedPost.jsx';
import PostModal from './components/PostModal.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import NotifSheet from './components/NotifSheet.jsx';
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
  const [discoveryPostsList, setDiscoveryPostsList] = useState(discoveryPosts);
  const [hasPosted, setHasPosted] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  function handlePost(photo, caption, visibility) {
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
    if (visibility === 'everyone') {
      setDiscoveryPostsList((prev) => [newPost, ...prev]);
    }
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
          <div className="quest-bar-top-row">
            <button className="quest-icon-btn" onClick={() => setShowProfile(true)} aria-label="add friends">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
            </button>
            <div className="quest-timer-pill">{formatCountdown(msLeft)}</div>
            <button className="quest-icon-btn" onClick={() => setShowNotifs(true)} aria-label="notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="quest-notif-dot" />
            </button>
          </div>
          <p className="quest-tagline"><span className="quest-emoji">{quest.emoji}</span> {quest.tagline}</p>
          <p className="quest-desc">{quest.description}</p>
          {!hasPosted && (
            <button className="quest-post-btn" onClick={() => setShowPost(true)}>
              complete quest
            </button>
          )}
        </header>


        <main className="feed">
          {(isFuture ? discoveryPostsList : friendPosts).map((post) => (
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
        </button>
        <button className={`bottom-tab ${tab === 'potential' ? 'bottom-tab--active' : ''}`} onClick={() => setTab('potential')}>
          future questies
        </button>
      </nav>

      {showPost    && <PostModal    quest={quest} onPost={handlePost} onClose={() => setShowPost(false)} />}
      {showProfile && <ProfileModal              onClose={() => setShowProfile(false)} />}
      {showNotifs  && <NotifSheet                onClose={() => setShowNotifs(false)} />}
    </div>
  );
}
