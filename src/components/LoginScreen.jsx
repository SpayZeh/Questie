import React, { useState } from 'react';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) { setError('enter a username'); return; }
    if (!password) { setError('enter a password'); return; }
    onLogin(username.trim());
  }

  return (
    <div className="login-screen">
      <div className="login-inner">
        <div className="login-brand">
          <p className="login-logo">questie</p>
          <p className="login-sub">your daily quest awaits.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="profile-input login-input"
            placeholder="username"
            value={username}
            autoCapitalize="none"
            autoCorrect="off"
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
          />
          <input
            className="profile-input login-input"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
          />
          {error && <p className="login-error">{error}</p>}
          <button className="quest-post-btn login-btn" type="submit">
            let's go
          </button>
        </form>
      </div>
    </div>
  );
}
