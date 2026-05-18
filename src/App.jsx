import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, doc, setDoc, getDoc, updateDoc, serverTimestamp, limit, where } from 'firebase/firestore';
import { auth, db } from './firebase.js';
import FeedPost from './components/FeedPost.jsx';
import PostModal from './components/PostModal.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import NotifSheet from './components/NotifSheet.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import LoginSheet from './components/LoginSheet.jsx';
import QuestComplete from './components/QuestComplete.jsx';
import UsernameSetup from './components/UsernameSetup.jsx';
import { requestNotificationPermission, notificationsSupported, notificationsBlocked } from './hooks/useNotifications.js';
import { msUntilReset, getLastResetTime, getTodaysQuest } from './data/quests.js';

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
  const [allPosts, setAllPosts] = useState([]);
  const [tab, setTab] = useState('potential');
  const quest = getTodaysQuest();
  const lastReset = getLastResetTime();
  const [showPost, setShowPost] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [hasPosted, setHasPosted] = useState(false);
  const [msLeft, setMsLeft] = useState(msUntilReset());
  const [posting, setPosting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingPost, setPendingPost] = useState(false);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [notifStatus, setNotifStatus] = useState(() =>
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  // Auth
  useEffect(() => {
    let unsubProfile = null;
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubProfile) { unsubProfile(); unsubProfile = null; }
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          const profile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            username: '',
            photoURL: firebaseUser.photoURL || '',
            streak: 0,
            following: [],
            createdAt: serverTimestamp(),
          };
          await setDoc(userRef, profile);
          setUserProfile(profile);
        }
        // Real-time subscription so following, streak, etc. always stay current
        unsubProfile = onSnapshot(userRef, (s) => {
          if (s.exists()) setUserProfile(s.data());
        });
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });
    return () => { unsubAuth(); if (unsubProfile) unsubProfile(); };
  }, []);

  // Auto-open post modal if user just logged in via quest button
  useEffect(() => {
    if (user && pendingPost) {
      setPendingPost(false);
      setShowLogin(false);
      setShowPost(true);
    }
  }, [user, pendingPost]);

  // Timer
  useEffect(() => {
    const id = setInterval(() => setMsLeft(msUntilReset()), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-register FCM token when user is logged in and permission already granted
  useEffect(() => {
    if (!user || notifStatus !== 'granted') return;
    requestNotificationPermission(user.uid).catch(() => {});
  }, [user]);

  const [pendingSent, setPendingSent] = useState([]);

  // Pending sent questie requests
  useEffect(() => {
    if (!user) { setPendingSent([]); return; }
    const q = query(collection(db, 'friendRequests'), where('from', '==', user.uid), where('status', '==', 'pending'));
    return onSnapshot(q, (snap) => setPendingSent(snap.docs.map((d) => d.data().to)));
  }, [user]);

  // Unread notifications
  useEffect(() => {
    if (!user) { setHasUnreadNotifs(false); return; }
    const q = query(collection(db, 'users', user.uid, 'notifications'), where('unread', '==', true), limit(1));
    return onSnapshot(q, (snap) => setHasUnreadNotifs(!snap.empty));
  }, [user]);

  // Feed subscription
  useEffect(() => {
    if (user === undefined) return;
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
      setAllPosts(all);
      setHasPosted(all.some((p) => p.userId === user.uid && p.createdAt && p.createdAt.toMillis() > lastReset.getTime()));
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
        questEmoji: quest.emoji,
        createdAt: serverTimestamp(),
        streak: newStreak,
        reactions: { quest: 0, heart: 0, laugh: 0 },
        commentCount: 0,
      });

      await updateDoc(doc(db, 'users', user.uid), { streak: newStreak });

      setUserProfile((prev) => ({ ...prev, streak: newStreak }));

      setShowPost(false);
      setShowCelebration(true);
    } catch (e) {
      console.error('post failed:', e);
      alert('failed to post. check your connection and try again.');
    }
    setPosting(false);
  }

  const isFuture = tab === 'potential';
  const following = userProfile?.following || [];
  const friendPosts = allPosts.filter((p) => p.userId === user?.uid || following.includes(p.userId));
  const worldPosts = allPosts.filter((p) => p.visibility === 'everyone');
  const questline = allPosts
    .filter((p) => p.userId === user?.uid)
    .map((p) => ({
      id: p.id,
      quest: p.questName,
      questEmoji: p.questEmoji,
      photo: p.photo,
      caption: p.caption,
      date: p.createdAt ? p.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
      time: p.createdAt ? p.createdAt.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase() : '',
    }))
    .reverse();

  if (splash || user === undefined) return <SplashScreen onDone={() => setSplash(false)} />;

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
              {hasUnreadNotifs && <span className="quest-notif-dot" />}
            </button>
          </div>
          <p className="quest-tagline"><span className="quest-emoji">{quest.emoji}</span> {quest.tagline}</p>
          <p className="quest-desc">{quest.description}</p>
          {!hasPosted && (
            <button className="quest-post-btn" onClick={() => {
              if (!user) { setPendingPost(true); setShowLogin(true); }
              else setShowPost(true);
            }}>
              complete quest
            </button>
          )}
          {!userProfile?.notificationsEnabled && notifStatus !== 'denied' && (
            <button className="quest-notif-prompt" onClick={async () => {
              if (!user) { setShowLogin(true); return; }
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
              const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
              if (isIOS && !isPWA) {
                alert('to get notifications on iPhone, tap the share button (□↑) in safari and choose "add to home screen", then open questie from there.');
                return;
              }
              if (!notificationsSupported()) {
                alert('notifications are not supported in this browser. try chrome on android or desktop.');
                return;
              }
              setNotifStatus('loading');
              try {
                const result = await requestNotificationPermission(user.uid);
                setNotifStatus(result);
                if (result === 'granted') setUserProfile((p) => ({ ...p, notificationsEnabled: true }));
                if (result === 'error') alert('notification setup failed. check console for details.');
              } catch (e) {
                console.error('notif button error:', e);
                alert('notification error: ' + e.message);
                setNotifStatus('default');
              }
            }}>
              {notifStatus === 'loading' ? 'setting up...' : 'want a nudge when the next quest drops?'}
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
              questEmoji={post.questEmoji || quest.emoji}
              showAddQuestie={!!user && isFuture && post.userId !== user?.uid && !following.includes(post.userId) && !pendingSent.includes(post.userId)}
              requested={pendingSent.includes(post.userId)}
              currentUser={user}
              currentUsername={userProfile?.username}
              currentAvatar={userProfile?.photoURL || user?.photoURL}
              onAddQuestie={(uid) => setUserProfile((prev) => ({ ...prev, following: [...(prev?.following || []), uid] }))}
            />
          ))}
        </main>

      </div>

      <nav className="bottom-nav">
        <button className={`bottom-tab ${tab === 'best' ? 'bottom-tab--active' : ''}`} onClick={() => setTab('best')}>
          my best questies
        </button>
        <button className="bottom-profile-btn" onClick={() => user ? setShowProfile(true) : setShowLogin(true)}>
          {(userProfile?.photoURL || user?.photoURL)
            ? <img src={userProfile?.photoURL || user?.photoURL} alt="profile" className="bottom-profile-avatar" referrerPolicy="no-referrer" />
            : <div className="bottom-profile-initials">{user ? (userProfile?.username || 'u')[0].toUpperCase() : '?'}</div>
          }
        </button>
        <button className={`bottom-tab ${tab === 'potential' ? 'bottom-tab--active' : ''}`} onClick={() => setTab('potential')}>
          world wide questies
        </button>
      </nav>

      {showPost    && <PostModal quest={quest} onPost={handlePost} posting={posting} onClose={() => setShowPost(false)} />}
      {showProfile && <ProfileModal user={user} userProfile={userProfile} questline={questline} onClose={() => setShowProfile(false)} onProfileUpdate={(update) => setUserProfile((prev) => ({ ...prev, ...update }))} />}
      {showNotifs  && <NotifSheet user={user} onClose={() => setShowNotifs(false)} />}
      {showLogin   && <LoginSheet onClose={() => { setShowLogin(false); setPendingPost(false); }} />}
      {showCelebration && <QuestComplete onDone={() => setShowCelebration(false)} />}
      {user && userProfile && !userProfile.username && (
        <UsernameSetup onConfirm={async (username) => {
          await updateDoc(doc(db, 'users', user.uid), { username });
          setUserProfile((prev) => ({ ...prev, username }));
        }} />
      )}
    </div>
  );
}
