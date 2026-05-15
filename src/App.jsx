import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, doc, setDoc, getDoc, updateDoc, serverTimestamp, limit, arrayUnion, increment } from 'firebase/firestore';
import { auth, db } from './firebase.js';
import FeedPost from './components/FeedPost.jsx';
import PostModal from './components/PostModal.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import NotifSheet from './components/NotifSheet.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import { msUntilReset } from './data/quests.js';

const quest = { emoji: '🌿', tagline: 'Touch Grass', description: 'literally, touch grass and capture it.', color: '#F97316' };

function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600).toString().padStart(2, '0');
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function timeAgo(timestamp) {
  if (!timestamp) return 'just now';
  const seconds = Math.floor((Date.now() - timestamp.toMillis()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export default function App() {
  const [splash, setSplash] = useState(true);
  const [user, setUser] = useState(undefined);
  const [userProfile, setUserProfile] = useState(null);
  const [friendPosts, setFriendPosts] = useState([]);
  const [worldPosts, setWorldPosts] = useState([]);
  const [tab, setTab] = useState('best');
  const [showPost, setShowPost] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [hasPosted, setHasPosted] = useState(false);
  const [msLeft, setMsLeft] = useState(msUntilReset());
  const [posting, setPosting] = useState(false);

  // Auth
  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          const profile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            username: (firebaseUser.displayName || 'user').toLowerCase().replace(/\s+/g, '.'),
            photoURL: firebaseUser.photoURL || '',
            streak: 0,
            questline: [],
            following: [],
            createdAt: serverTimestamp(),
          };
          await setDoc(userRef, profile);
          setUserProfile(profile);
        } else {
          setUserProfile(snap.data());
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });
  }, []);

  // Timer
  useEffect(() => {
    const id = setInterval(() => setMsLeft(msUntilReset()), 1000);
    return () => clearInterval(id);
  }, []);

  // Feed subscription
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          timeAgo: data.createdAt ? timeAgo(data.createdAt) : 'just now',
          isNew: data.createdAt ? (Date.now() - data.createdAt.toMillis()) < 300000 : false,
        };
      });
      setFriendPosts(all.filter((p) => p.userId === user.uid));
      setWorldPosts(all.filter((p) => p.visibility === 'everyone'));
    });
    return unsub;
  }, [user]);

  async function handlePost(compressedDataUrl, caption, visibility) {
    if (posting) return;
    setPosting(true);
    try {
      const photo = compressedDataUrl;
      const newStreak = (userProfile?.streak || 0) + 1;

      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        username: userProfile?.username || user.displayName || 'user',
        avatar: user.photoURL || '',
        photo,
        caption,
        visibility,
        questName: quest.tagline.toLowerCase(),
        createdAt: serverTimestamp(),
        streak: newStreak,
        reactions: { quest: 0, heart: 0, laugh: 0 },
        commentCount: 0,
      });

      const now = new Date();
      const newEntry = {
        id: Date.now(),
        quest: quest.tagline.toLowerCase(),
        photo,
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase(),
      };

      await updateDoc(doc(db, 'users', user.uid), {
        streak: newStreak,
        questline: arrayUnion(newEntry),
      });

      setUserProfile((prev) => ({
        ...prev,
        streak: newStreak,
        questline: [newEntry, ...(prev?.questline || [])],
      }));

      setHasPosted(true);
      setTab('best');
      setShowPost(false);
    } catch (e) {
      console.error('post failed:', e);
      alert('failed to post. check your connection and try again.');
    }
    setPosting(false);
  }

  const isFuture = tab === 'potential';
  const questline = [...(userProfile?.questline || [])].reverse();

  if (splash) return <SplashScreen onDone={() => setSplash(false)} />;
  if (user === undefined) return <SplashScreen onDone={() => {}} />;
  if (!user) return <LoginScreen />;

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
          {(isFuture ? worldPosts : friendPosts).length === 0 && (
            <p className="feed-empty">
              {isFuture ? 'no world wide posts yet. be the first!' : 'complete your first quest to get started!'}
            </p>
          )}
          {(isFuture ? worldPosts : friendPosts).map((post) => (
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
          {user.photoURL
            ? <img src={user.photoURL} alt="profile" className="bottom-profile-avatar" referrerPolicy="no-referrer" />
            : <div className="bottom-profile-initials">{(userProfile?.username || 'u')[0].toUpperCase()}</div>
          }
        </button>
        <button className={`bottom-tab ${tab === 'potential' ? 'bottom-tab--active' : ''}`} onClick={() => setTab('potential')}>
          world wide questies
        </button>
      </nav>

      {showPost    && <PostModal quest={quest} onPost={handlePost} posting={posting} onClose={() => setShowPost(false)} />}
      {showProfile && <ProfileModal user={user} userProfile={userProfile} questline={questline} onClose={() => setShowProfile(false)} />}
      {showNotifs  && <NotifSheet onClose={() => setShowNotifs(false)} />}
    </div>
  );
}
