import React, { useState } from 'react';

// 기본 배경 이미지 경로
const DEFAULT_BG = '/assets/main-bg.jpg';

function MainBackground({ isAdmin = false }) {
  const [bgImage, setBgImage] = useState(DEFAULT_BG);

  // 관리자용 이미지 변경 핸들러
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBgImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
    }}>
      {isAdmin && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
          <input type="file" accept="image/*" onChange={handleChange} />
        </div>
      )}
    </div>
  );
}

export default MainBackground;
