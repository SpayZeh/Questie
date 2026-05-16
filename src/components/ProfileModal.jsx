import React, { useState, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, getDoc, collection, getDocs, addDoc, arrayUnion, arrayRemove, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase.js';
import QuestlineSheet from './QuestlineSheet.jsx';

function compressAvatar(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const size = Math.min(400, Math.max(img.width, img.height));
      const scale = size / Math.max(img.width, img.height);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      canvas.toBlob(resolve, 'image/jpeg', 0.82);
    };
    img.src = url;
  });
}

const REQUEST_TEXTS = [
  'wants to be your new questie',
  'really wants to be your questie',
  'is desperately trying to become your questie',
  'really really wants to quest with you',
];

export default function ProfileModal({ user, userProfile, questline, onClose, onProfileUpdate }) {
  const [name, setName] = useState(userProfile?.username || user?.displayName || 'you');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.photoURL || user?.photoURL || '');
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [showQuestline, setShowQuestline] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [added, setAdded] = useState({});
  const [removing, setRemoving] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const avatarInputRef = useRef(null);

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file || !user) return;
    setAvatarSaving(true);
    try {
      const blob = await compressAvatar(file);
      const snapshot = await uploadBytes(ref(storage, `avatars/${user.uid}.jpg`), blob);
      const url = await getDownloadURL(snapshot.ref);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      setAvatarUrl(url);
      onProfileUpdate?.({ photoURL: url });
    } catch (err) {
      console.error('avatar update failed:', err);
    }
    setAvatarSaving(false);
  }

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'friendRequests'), where('to', '==', user.uid));
    return onSnapshot(q, (snap) => {
      setPendingRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((r) => r.status === 'pending'));
    });
  }, [user]);

  useEffect(() => {
    if (!user || !userProfile?.following?.length) return;
    async function loadFriends() {
      const docs = await Promise.all(
        userProfile.following.map((uid) => getDoc(doc(db, 'users', uid)))
      );
      setFriends(docs.filter((d) => d.exists()).map((d) => ({ id: d.id, ...d.data() })));
    }
    loadFriends();
  }, [user, userProfile?.following]);

  useEffect(() => {
    if (!searchVal.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      const val = searchVal.trim().toLowerCase();
      const snap = await getDocs(collection(db, 'users'));
      setSearchResults(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((u) => u.id !== user?.uid && u.username?.toLowerCase().includes(val))
      );
      setSearchLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal, user]);

  async function handleSave() {
    setSaving(true);
    const cleanName = name.trim().toLowerCase();
    try {
      if (user && cleanName !== userProfile?.username) {
        await updateDoc(doc(db, 'users', user.uid), { username: cleanName });
        onProfileUpdate?.({ username: cleanName });
      }
    } catch (e) {
      console.error('save failed:', e);
    }
    setSaving(false);
    onClose();
  }

  async function handleSignOut() {
    await signOut(auth);
    onClose();
  }

  async function handleAcceptRequest(req) {
    try {
      await updateDoc(doc(db, 'friendRequests', req.id), { status: 'accepted' });
      await updateDoc(doc(db, 'users', user.uid), { following: arrayUnion(req.from) });
      await updateDoc(doc(db, 'users', req.from), { following: arrayUnion(user.uid) });
      await addDoc(collection(db, 'users', req.from, 'notifications'), {
        type: 'accepted',
        fromUid: user.uid,
        fromUsername: userProfile?.username || 'someone',
        fromAvatar: userProfile?.photoURL || user.photoURL || '',
        text: 'accepted your questie request',
        unread: true,
        pushed: false,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('accept failed:', e);
    }
  }

  async function handleDeclineRequest(req) {
    try {
      await updateDoc(doc(db, 'friendRequests', req.id), { status: 'declined' });
    } catch (e) {
      console.error('decline failed:', e);
    }
  }

  async function handleAdd(r) {
    if (added[r.id] || friends.some((f) => f.id === r.id)) return;
    setAdded((p) => ({ ...p, [r.id]: true }));
    try {
      const reqRef = await addDoc(collection(db, 'friendRequests'), {
        from: user.uid,
        fromUsername: userProfile?.username || user.displayName || 'someone',
        fromAvatar: user.photoURL || '',
        to: r.id,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      const text = REQUEST_TEXTS[Math.floor(Math.random() * REQUEST_TEXTS.length)];
      await addDoc(collection(db, 'users', r.id, 'notifications'), {
        type: 'request',
        fromUid: user.uid,
        fromUsername: userProfile?.username || user.displayName || 'someone',
        fromAvatar: user.photoURL || '',
        text,
        requestId: reqRef.id,
        unread: true,
        pushed: false,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('add failed:', e);
    }
    setSearchVal('');
    setSearchResults([]);
  }

  async function handleRemove(id) {
    try {
      await updateDoc(doc(db, 'users', user.uid), { following: arrayRemove(id) });
    } catch (e) {
      console.error('remove failed:', e);
    }
    setFriends((prev) => prev.filter((f) => f.id !== id));
    setRemoving(null);
  }

  return (
    <>
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet profile-sheet">
        <div className="modal-header">
          <h2 className="modal-title">profile</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="profile-avatar-section">
          <div
            className={`profile-avatar-wrap profile-avatar-wrap--editable${avatarSaving ? ' profile-avatar-wrap--saving' : ''}`}
            onClick={() => !avatarSaving && avatarInputRef.current?.click()}
            title="change photo"
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="profile-big-avatar" referrerPolicy="no-referrer" />
              : <div className="profile-big-avatar profile-big-avatar--initials">{name[0]?.toUpperCase()}</div>
            }
            <div className="profile-avatar-overlay">
              {avatarSaving ? '...' : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>
          <p className="profile-avatar-hint">{user?.email}</p>
        </div>

        <div className="profile-field">
          <label className="profile-label">username</label>
          <input
            className="profile-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="your username"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>

        <button className="modal-post-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'saving...' : 'save'}
        </button>
        <button className="profile-questline-btn" onClick={() => setShowQuestline(true)}>my questline</button>
        {userProfile?.notificationsEnabled && (
          <button className="profile-signout-btn" style={{ color: 'var(--sub)', fontSize: 13 }} onClick={async () => {
            try {
              await updateDoc(doc(db, 'users', user.uid), { notificationsEnabled: false, fcmToken: null });
              onProfileUpdate?.({ notificationsEnabled: false });
            } catch (e) {
              console.error('opt out failed:', e);
            }
          }}>
            turn off quest notifications
          </button>
        )}
        <button className="profile-signout-btn" onClick={handleSignOut}>sign out</button>

        <div className="profile-divider" />

        <p className="profile-section-title">add a questie</p>
        <div className="profile-search-row">
          <input
            className="profile-input"
            placeholder="search by username..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>

        {searchLoading && <p className="comment-empty">searching...</p>}
        {!searchLoading && searchVal.trim() && searchResults.length === 0 && (
          <p className="comment-empty">no users found.</p>
        )}
        {searchResults.map((r) => (
          <div key={r.id} className="profile-friend-row">
            {r.photoURL
              ? <img src={r.photoURL} alt={r.username} className="comment-avatar" referrerPolicy="no-referrer" />
              : <div className="comment-avatar post-avatar--initials">{(r.username || 'u')[0].toUpperCase()}</div>
            }
            <span className="profile-friend-name">{r.username}</span>
            <button
              className={`profile-add-btn ${added[r.id] || friends.some((f) => f.id === r.id) ? 'profile-add-btn--done' : ''}`}
              onClick={() => handleAdd(r)}
            >
              {added[r.id] || friends.some((f) => f.id === r.id) ? 'added' : '+ add'}
            </button>
          </div>
        ))}

        <div className="profile-divider" />

        <p className="profile-section-title">potential questies ({pendingRequests.length})</p>
        {pendingRequests.length === 0 && (
          <p className="comment-empty">no pending requests.</p>
        )}
        {pendingRequests.map((req) => (
          <div key={req.id} className="profile-friend-row">
            {req.fromAvatar
              ? <img src={req.fromAvatar} alt={req.fromUsername} className="comment-avatar" referrerPolicy="no-referrer" />
              : <div className="comment-avatar post-avatar--initials">{(req.fromUsername || 'u')[0].toUpperCase()}</div>
            }
            <span className="profile-friend-name">{req.fromUsername}</span>
            <div className="profile-remove-confirm">
              <button className="notif-btn notif-btn--accept" onClick={() => handleAcceptRequest(req)}>accept</button>
              <button className="notif-btn notif-btn--decline" onClick={() => handleDeclineRequest(req)}>decline</button>
            </div>
          </div>
        ))}

        <div className="profile-divider" />

        <p className="profile-section-title">my questies ({friends.length})</p>
        {friends.length === 0 && (
          <p className="comment-empty">no questies yet. add some!</p>
        )}
        {friends.map((f) => (
          <div key={f.id} className="profile-friend-row">
            {f.photoURL
              ? <img src={f.photoURL} alt={f.username} className="comment-avatar" referrerPolicy="no-referrer" />
              : <div className="comment-avatar post-avatar--initials">{(f.username || 'u')[0].toUpperCase()}</div>
            }
            <span className="profile-friend-name">{f.username}</span>
            {removing === f.id ? (
              <div className="profile-remove-confirm">
                <button className="notif-btn notif-btn--decline" onClick={() => handleRemove(f.id)}>remove</button>
                <button className="notif-btn" style={{ background: 'var(--muted)', color: 'var(--sub)' }} onClick={() => setRemoving(null)}>cancel</button>
              </div>
            ) : (
              <button className="profile-remove-btn" onClick={() => setRemoving(f.id)}>manage</button>
            )}
          </div>
        ))}
      </div>
    </div>

    {showQuestline && <QuestlineSheet questline={questline} onClose={() => setShowQuestline(false)} />}
    </>
  );
}
