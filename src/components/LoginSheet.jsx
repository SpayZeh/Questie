import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase.js';

function isInAppBrowser() {
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|Twitter|LinkedIn|Line|WhatsApp|Snapchat|MicroMessenger/.test(ua);
}

function getOpenInBrowserUrl() {
  return window.location.href;
}

export default function LoginSheet({ onClose }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inAppBrowser = isInAppBrowser();

  async function handleGoogle() {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      onClose?.();
    } catch {
      setError('something went wrong. try again.');
      setLoading(false);
    }
  }

  async function handleEmail(e) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose?.();
    } catch (err) {
      const msgs = {
        'auth/user-not-found':       "no account found. sign up instead?",
        'auth/wrong-password':        "wrong password.",
        'auth/invalid-credential':    "wrong email or password.",
        'auth/email-already-in-use':  "email already in use. log in instead?",
        'auth/weak-password':         "password needs at least 6 characters.",
        'auth/invalid-email':         "that doesn't look like a valid email.",
      };
      setError(msgs[err.code] || 'something went wrong. try again.');
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal-sheet login-sheet">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{mode === 'login' ? 'welcome back' : 'become a questie'}</h2>
            <p className="modal-sub">sign in to complete and share your quest</p>
          </div>
          {onClose && <button className="modal-close" onClick={onClose}>✕</button>}
        </div>

        {inAppBrowser && (
          <div className="inapp-browser-warning">
            <p>Google sign-in doesn't work inside Messenger/Instagram.</p>
            <a className="inapp-browser-link" href={getOpenInBrowserUrl()} target="_blank" rel="noreferrer">
              open in Safari or Chrome instead
            </a>
          </div>
        )}

        <button className="google-login-btn" onClick={handleGoogle} disabled={loading || inAppBrowser}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          continue with google
        </button>

        <div className="login-divider"><span>or</span></div>

        <form className="login-form" onSubmit={handleEmail}>
          <input
            className="profile-input login-input"
            type="email"
            placeholder="email"
            value={email}
            autoCapitalize="none"
            autoCorrect="off"
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
          />
          <input
            className="profile-input login-input"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
          />
          {error && <p className="login-error">{error}</p>}
          <button
            className={`modal-post-btn${!email || !password ? ' modal-post-btn--disabled' : ''}`}
            type="submit"
            disabled={loading || !email || !password}
          >
            {loading ? 'one sec...' : mode === 'login' ? 'log in' : 'sign up'}
          </button>
        </form>

        <button className="login-toggle" onClick={() => { setMode((m) => m === 'login' ? 'signup' : 'login'); setError(''); }}>
          {mode === 'login' ? "no account yet? sign up" : "already have an account? log in"}
        </button>
      </div>
    </div>
  );
}
