import React, { useState } from 'react';

const CREDENTIALS = { username: 'questie', password: 'goquest' };

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (username.trim() === CREDENTIALS.username && password === CREDENTIALS.password) {
      onLogin();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-inner">
        <div className="login-brand">
          <p className="login-logo">questie</p>
          <p className="login-sub">your daily quest awaits.</p>
        </div>

        <form className={`login-form${shaking ? ' login-form--shake' : ''}`} onSubmit={handleSubmit}>
          <input
            className={`profile-input login-input${error ? ' login-input--error' : ''}`}
            placeholder="username"
            value={username}
            autoCapitalize="none"
            autoCorrect="off"
            onChange={(e) => { setUsername(e.target.value); setError(false); }}
          />
          <input
            className={`profile-input login-input${error ? ' login-input--error' : ''}`}
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
          />
          {error && <p className="login-error">wrong username or password</p>}
          <button className="quest-post-btn login-btn" type="submit">
            log in
          </button>
        </form>
      </div>
    </div>
  );
}
