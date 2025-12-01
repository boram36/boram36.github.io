import React from "react";
import "../styles/ImageModal.css";

export default function ImageModal({ src, onClose }) {
  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={e => e.stopPropagation()}>
        <img src={src} alt="확대 이미지" />
        <button className="image-modal-close" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
