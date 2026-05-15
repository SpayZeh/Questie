import React, { useState, useRef } from 'react';
import QuestlineSheet from './QuestlineSheet.jsx';

const MOCK_FRIENDS = [
  { id: 'f1', username: 'irene.daily', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: 'f2', username: 'joel.g',      avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: 'f3', username: 'soph.snaps',  avatar: 'https://i.pravatar.cc/150?img=32' },
];

export default function ProfileModal({ onClose }) {
  const [name, setName] = useState('you');
  const [showQuestline, setShowQuestline] = useState(false);
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/150?img=5');
  const [preview, setPreview] = useState(null);
  const [searchVal, setSearchVal] = useState('');
  const [friends, setFriends] = useState(MOCK_FRIENDS);
  const [added, setAdded] = useState({});
  const [removing, setRemoving] = useState(null);
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

  function handleAdd(r) {
    setAdded((p) => ({ ...p, [r.id]: true }));
    setFriends((prev) => [...prev, { id: r.id, username: r.username, avatar: r.avatar }]);
    setSearchVal('');
  }

  function handleRemove(id) {
    setFriends((prev) => prev.filter((f) => f.id !== id));
    setRemoving(null);
  }

  const results = searchVal.trim()
    ? [{ id: 'new1', username: searchVal.toLowerCase().replace(/\s+/g, '.'), avatar: `https://i.pravatar.cc/150?img=68` }]
    : [];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet profile-sheet">
        <div className="modal-header">
          <h2 className="modal-title">profile</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="profile-avatar-section">
          <div className="profile-avatar-wrap" onClick={() => fileRef.current?.click()}>
            <img src={preview || avatar} alt="avatar" className="profile-big-avatar" />
            <div className="profile-avatar-overlay">change</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          <p className="profile-avatar-hint">tap to change photo</p>
        </div>

        <div className="profile-field">
          <label className="profile-label">name</label>
          <input
            className="profile-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="your name"
          />
        </div>

        <div className="profile-btn-row">
          <button className="modal-post-btn profile-save-btn" onClick={handleSave}>save</button>
          <button className="profile-questline-btn" onClick={() => setShowQuestline(true)}>my questline</button>
        </div>

        <div className="profile-divider" />

        <p className="profile-section-title">add a questie</p>
        <div className="profile-search-row">
          <input
            className="profile-input"
            placeholder="search by username..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>

        {results.map((r) => (
          <div key={r.id} className="profile-friend-row">
            <img src={r.avatar} alt={r.username} className="comment-avatar" />
            <span className="profile-friend-name">{r.username}</span>
            <button
              className={`profile-add-btn ${added[r.id] ? 'profile-add-btn--done' : ''}`}
              onClick={() => !added[r.id] && handleAdd(r)}
            >
              {added[r.id] ? 'added' : '+ add'}
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
            <img src={f.avatar} alt={f.username} className="comment-avatar" />
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

    {showQuestline && <QuestlineSheet onClose={() => setShowQuestline(false)} />}
  );
}
