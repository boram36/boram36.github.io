import React, { useState } from 'react';

// 샘플 데이터 구조
const initialItems = [
  { id: 1, text: '작가 소개 텍스트', image: null },
  { id: 2, text: '경력 사항', image: '/assets/sample.jpg' },
];

function BiographyInfo({ isAdmin = false }) {
  const [items, setItems] = useState(initialItems);
  const [openId, setOpenId] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  // 이미지 클릭 시 확대
  const handleImageClick = (img) => setZoomImage(img);
  // 닫기
  const handleCloseZoom = () => setZoomImage(null);

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      <h2>Biography Info</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(item => (
          <li key={item.id} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>{item.text}</span>
              {item.image && (
                <span
                  style={{ marginLeft: 8, cursor: 'pointer', color: 'blue' }}
                  onClick={() => setOpenId(openId === item.id ? null : item.id)}
                >
                  ●
                </span>
              )}
            </div>
            {item.image && openId === item.id && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={item.image}
                  alt="info-img"
                  style={{ width: 120, cursor: 'pointer', border: '1px solid #ccc' }}
                  onClick={() => handleImageClick(item.image)}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
      {/* 이미지 확대 뷰 */}
      {zoomImage && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}
          onClick={handleCloseZoom}
        >
          <img src={zoomImage} alt="zoom" style={{ maxWidth: '80vw', maxHeight: '80vh', boxShadow: '0 0 20px #000' }} />
        </div>
      )}
    </div>
  );
}

export default BiographyInfo;
