import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, getDoc, collection, getDocs, addDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import QuestlineSheet from './QuestlineSheet.jsx';

const REQUEST_TEXTS = [
  'wants to be your new questie',
  'really wants to be your questie',
  'is desperately trying to become your questie',
  'really really wants to quest with you',
];

export default function ProfileModal({ user, userProfile, questline, onClose, onProfileUpdate }) {
  const [name, setName] = useState(userProfile?.username || user?.displayName || 'you');
  const [showQuestline, setShowQuestline] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [added, setAdded] = useState({});
  const [removing, setRemoving] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

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

  async function handleAdd(r) {
    if (added[r.id] || friends.some((f) => f.id === r.id)) return;
    setAdded((p) => ({ ...p, [r.id]: true }));
    try {
      await updateDoc(doc(db, 'users', user.uid), { following: arrayUnion(r.id) });
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
        createdAt: serverTimestamp(),
      });
      setFriends((prev) => [...prev, r]);
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
          <div className="profile-avatar-wrap">
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" className="profile-big-avatar" referrerPolicy="no-referrer" />
              : <div className="profile-big-avatar profile-big-avatar--initials">{name[0]?.toUpperCase()}</div>
            }
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
