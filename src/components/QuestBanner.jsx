import React, { useRef } from 'react';

const EXAMPLES = {
  0: ['red hoodie selfie', 'red mug close-up', 'stop sign + you'],
  1: ['park doggo selfie', 'neighbours pup', 'any good boy counts'],
  2: ['facetime screenshot', 'call log screenshot', 'voice memo counts'],
  3: ['sunset balcony shot', 'golden window light', 'sunrise walk'],
  4: ['barefoot on grass', 'hand in a lawn', 'park picnic snap'],
  5: ['coffee + book setup', 'window seat vibe', 'cozy corner flat lay'],
  6: ['bathroom mirror', 'shop window reflection', 'sunglasses selfie'],
  7: ['lunch plate', 'snack close-up', 'fancy dinner flex'],
  8: ['rain on window', 'umbrella selfie', 'puddle reflection'],
  9: ['bookshelf shelfie', 'kindle home screen', 'one book cover'],
};

export default function QuestBanner({ quest, nextQuest }) {
  const fileRef = useRef(null);
  const examples = EXAMPLES[quest.id] || [];

  return (
    <div className="quest-banner" style={{ '--qcolor': quest.color }}>
      <div className="quest-banner-top">
        <span className="quest-banner-emoji">{quest.emoji}</span>
        <div className="quest-banner-text">
          <p className="quest-banner-title">{quest.title}</p>
          <p className="quest-banner-next">Next: {nextQuest.emoji} {nextQuest.title}</p>
        </div>
        <button className="quest-banner-cta" onClick={() => fileRef.current?.click()}>
          Post
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" capture="environment" style={{ display: 'none' }} />
      </div>
      <div className="quest-examples">
        {examples.map((ex, i) => (
          <span key={i} className="quest-example-pill">{ex}</span>
        ))}
      </div>
    </div>
  );
}
