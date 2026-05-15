import React from 'react';

export default function Header({ questColor }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">🗺️</span>
          <span className="logo-text">Questie</span>
        </div>
        <button className="avatar-btn" aria-label="Profile">
          <img
            src="https://i.pravatar.cc/150?img=33"
            alt="Your profile"
            className="avatar-img"
          />
          <span className="avatar-badge">✨</span>
        </button>
      </div>
    </header>
  );
}
