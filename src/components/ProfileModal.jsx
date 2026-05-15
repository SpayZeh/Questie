import React, { useState, useRef } from 'react';

const MOCK_FRIENDS = [
  { id: 'f1', username: 'irene.daily', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: 'f2', username: 'joel.g',      avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: 'f3', username: 'soph.snaps',  avatar: 'https://i.pravatar.cc/150?img=32' },
];

export default function ProfileModal({ onClose }) {
  const [name, setName] = useState('you');
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/150?img=5');
  const [preview, setPreview] = useState(null);
  const [searchVal, setSearchVal] = useState('');
  const [friends, setFriends] = useState(MOCK_FRIENDS);
  const [added, setAdded] = useState({});
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  function handleSave() {
    if (preview) setAvatar(preview);
    onClose();
  }

  const results = searchVal.trim()
    ? [{ id: 'new1', username: searchVal.toLowerCase().replace(/\s+/g, '.'), avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random()*70)+1}` }]
    : [];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet profile-sheet">
        <div className="modal-header">
          <h2 className="modal-title">Profile</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Avatar */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrap" onClick={() => fileRef.current?.click()}>
            <img src={preview || avatar} alt="avatar" className="profile-big-avatar" />
            <div className="profile-avatar-overlay">📷</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          <p className="profile-avatar-hint">tap to change photo</p>
        </div>

        {/* Name */}
        <div className="profile-field">
          <label className="profile-label">name</label>
          <input
            className="profile-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="your name"
          />
        </div>

        <button className="modal-post-btn" onClick={handleSave}>Save</button>

        {/* Divider */}
        <div className="profile-divider" />

        {/* Add questie */}
        <p className="profile-section-title">add a questie</p>
        <div className="profile-search-row">
          <input
            className="profile-input"
            placeholder="search by username..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
          />
        </div>

        {results.map(r => (
          <div key={r.id} className="profile-friend-row">
            <img src={r.avatar} alt={r.username} className="comment-avatar" />
            <span className="profile-friend-name">{r.username}</span>
            <button
              className={`profile-add-btn ${added[r.id] ? 'profile-add-btn--done' : ''}`}
              onClick={() => setAdded(p => ({ ...p, [r.id]: true }))}
            >
              {added[r.id] ? 'added ✓' : '+ add'}
            </button>
          </div>
        ))}

        {/* Current questies */}
        <p className="profile-section-title" style={{ marginTop: 8 }}>my questies</p>
        {friends.map(f => (
          <div key={f.id} className="profile-friend-row">
            <img src={f.avatar} alt={f.username} className="comment-avatar" />
            <span className="profile-friend-name">{f.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
