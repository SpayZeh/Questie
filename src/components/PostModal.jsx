import React, { useState, useRef } from 'react';

const MAX_PX = 1200;
const QUALITY = 0.8;

function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', QUALITY));
    };
    img.src = url;
  });
}

export default function PostModal({ quest, onPost, onClose }) {
  const [preview, setPreview] = useState(null);
  const [compressed, setCompressed] = useState(null);
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState('questies');
  const [posted, setPosted] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setCompressing(true);
    const dataUrl = await compressImage(file);
    setCompressed(dataUrl);
    setCompressing(false);
  }

  function handlePost() {
    if (!compressed) return;
    setPosted(true);
    setTimeout(() => onPost(compressed, caption, visibility), 900);
  }

  const ready = compressed && !compressing;

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
            <>
              <img src={preview} alt="preview" className="modal-preview" onClick={() => fileRef.current?.click()} />
              {compressing && <div className="modal-compressing">compressing...</div>}
            </>
          ) : (
            <>
              <div className="modal-camera-icon">📷</div>
              <p className="modal-upload-title">add photo or video</p>
              <p className="modal-upload-sub">show the world your completion!</p>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <textarea
          className="modal-caption"
          placeholder="add a caption... (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
        />

        <div className="visibility-toggle">
          <button
            className={`visibility-opt${visibility === 'questies' ? ' visibility-opt--active' : ''}`}
            onClick={() => setVisibility('questies')}
          >
            my questies only
          </button>
          <button
            className={`visibility-opt${visibility === 'everyone' ? ' visibility-opt--active' : ''}`}
            onClick={() => setVisibility('everyone')}
          >
            everyone
          </button>
        </div>

        <button
          className={`modal-post-btn ${!ready ? 'modal-post-btn--disabled' : ''} ${posted ? 'modal-post-btn--done' : ''}`}
          onClick={handlePost}
          disabled={!ready}
        >
          {posted ? 'posted!' : compressing ? 'processing...' : 'post to feed'}
        </button>
      </div>
    </div>
  );
}
