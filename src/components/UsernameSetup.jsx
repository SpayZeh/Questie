import React, { useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase.js';

function validate(val) {
  if (val.length < 3) return 'at least 3 characters';
  if (val.length > 20) return 'max 20 characters';
  if (!/^[a-z0-9._]+$/.test(val)) return 'only letters, numbers, dots, underscores';
  return null;
}

export default function UsernameSetup({ onConfirm }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  function handleChange(e) {
    const v = e.target.value.toLowerCase().replace(/\s+/g, '.');
    setValue(v);
    setError('');
  }

  async function handleSubmit() {
    const clean = value.trim();
    const validationError = validate(clean);
    if (validationError) { setError(validationError); return; }

    setChecking(true);
    const snap = await getDocs(query(collection(db, 'users'), where('username', '==', clean), limit(1)));
    if (!snap.empty) {
      setError('username already taken');
      setChecking(false);
      return;
    }
    setChecking(false);
    onConfirm(clean);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-sheet" style={{ gap: 16 }}>
        <div className="modal-header">
          <h2 className="modal-title">pick a username</h2>
        </div>
        <p className="modal-sub" style={{ marginTop: -8 }}>this is how other questies will find you</p>
        <input
          className="profile-input"
          placeholder="your username"
          value={value}
          onChange={handleChange}
          autoCapitalize="none"
          autoCorrect="off"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        {error && <p style={{ color: 'var(--accent)', fontSize: 13, margin: 0 }}>{error}</p>}
        <button
          className="modal-post-btn"
          onClick={handleSubmit}
          disabled={checking || !value.trim()}
        >
          {checking ? 'checking...' : 'continue'}
        </button>
      </div>
    </div>
  );
}
