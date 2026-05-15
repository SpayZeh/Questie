import React, { useState, useRef } from 'react';

export default function PostModal({ quest, onPost, onClose }) {
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [posted, setPosted] = useState(false);
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  function handlePost() {
    if (!preview) return;
    setPosted(true);
    setTimeout(() => onPost(preview, caption), 900);
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">complete quest</h2>
            <p className="modal-sub">{quest.emoji} {quest.description}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div
          className={`modal-upload ${preview ? 'modal-upload--filled' : ''}`}
          onClick={() => !preview && fileRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="preview" className="modal-preview" onClick={() => fileRef.current?.click()} />
          ) : (
            <>
              <div className="modal-camera-icon">📷</div>
              <p className="modal-upload-title">add photo or video</p>
              <p className="modal-upload-sub">show the world your completion!</p>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*,video/*" capture="environment" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <textarea
          className="modal-caption"
          placeholder="add a caption... (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
        />

        <button
          className={`modal-post-btn ${!preview ? 'modal-post-btn--disabled' : ''} ${posted ? 'modal-post-btn--done' : ''}`}
          onClick={handlePost}
          disabled={!preview}
        >
          {posted ? 'posted! 🎉' : 'post to feed 🎯'}
        </button>
      </div>
    </div>
  );
}
