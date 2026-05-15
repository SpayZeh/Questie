import React, { useEffect, useState } from 'react';

const EMOJIS = ['🎉', '✨', '⭐', '💫', '🎊', '🌟', '⚡', '🎈', '🏆', '🎯'];

function rand(a, b) { return a + Math.random() * (b - a); }

const particles = Array.from({ length: 48 }, (_, i) => ({
  id: i,
  emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
  left: `${rand(0, 100)}%`,
  delay: `${rand(0, 1.4)}s`,
  duration: `${rand(1.4, 2.8)}s`,
  size: `${rand(1.1, 2.2)}rem`,
}));

export default function QuestComplete({ onDone }) {
  const [out, setOut] = useState(false);

  useEffect(() => {
    const fade = setTimeout(() => setOut(true), 2200);
    const done = setTimeout(() => onDone?.(), 3000);
    return () => { clearTimeout(fade); clearTimeout(done); };
  }, []);

  return (
    <div className={`qc-overlay${out ? ' qc-overlay--out' : ''}`}>
      {particles.map((p) => (
        <span
          key={p.id}
          className="qc-particle"
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, fontSize: p.size }}
        >
          {p.emoji}
        </span>
      ))}
      <p className="qc-title">well quested!</p>
    </div>
  );
}
