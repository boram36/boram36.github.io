import React, { useState } from 'react';

// 샘플 데이터
const initialItems = [
  { id: 1, year: 2025, text: '비디오 설명', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: 2, year: 2024, text: '영상 링크', url: 'https://player.vimeo.com/video/76979871' },
];

function Video({ isAdmin = false }) {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState({ year: new Date().getFullYear(), text: '', url: '' });
  const [editId, setEditId] = useState(null);
  const [editItem, setEditItem] = useState(null);

  // 최신순 정렬
  const sortedItems = [...items].sort((a, b) => b.year - a.year || a.id - b.id);

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  // 추가
  const handleAdd = () => {
    if (!newItem.text || !newItem.url) return;
    setItems([
      { ...newItem, id: Date.now() },
      ...items,
    ]);
    setNewItem({ year: new Date().getFullYear(), text: '', url: '' });
  };

  // 삭제
  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // 수정 시작
  const handleEditStart = (item) => {
    setEditId(item.id);
    setEditItem({ ...item });
  };

  // 수정 입력 핸들러
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditItem({ ...editItem, [name]: value });
  };

  // 수정 저장
  const handleEditSave = () => {
    setItems(items.map(item => item.id === editId ? { ...editItem } : item));
    setEditId(null);
    setEditItem(null);
  };

  // 수정 취소
  const handleEditCancel = () => {
    setEditId(null);
    setEditItem(null);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 700, margin: '0 auto' }}>
      <h2>Video</h2>
      {isAdmin && (
        <div style={{ marginBottom: '1rem', border: '1px solid #eee', padding: '1rem', borderRadius: 8 }}>
          <input type="number" name="year" value={newItem.year} min="1900" max={new Date().getFullYear()} onChange={handleChange} style={{ width: 80 }} />
          <input type="text" name="text" value={newItem.text} onChange={handleChange} placeholder="내용 입력" style={{ marginLeft: 8, width: 200 }} />
          <input type="text" name="url" value={newItem.url} onChange={handleChange} placeholder="영상 링크(URL)" style={{ marginLeft: 8, width: 250 }} />
          <button onClick={handleAdd} style={{ marginLeft: 8 }}>추가</button>
        </div>
      )}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sortedItems.map(item => (
          <li key={item.id} style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            {editId === item.id ? (
              <div>
                <input type="number" name="year" value={editItem.year} min="1900" max={new Date().getFullYear()} onChange={handleEditChange} style={{ width: 80 }} />
                <input type="text" name="text" value={editItem.text} onChange={handleEditChange} placeholder="내용 입력" style={{ marginLeft: 8, width: 200 }} />
                <input type="text" name="url" value={editItem.url} onChange={handleEditChange} placeholder="영상 링크(URL)" style={{ marginLeft: 8, width: 250 }} />
                <button onClick={handleEditSave} style={{ marginLeft: 8 }}>저장</button>
                <button onClick={handleEditCancel} style={{ marginLeft: 8 }}>취소</button>
              </div>
            ) : (
              <div>
                <span>{item.year}</span>
                <div>{item.text}</div>
                {item.url && (
                  <div style={{ marginTop: 8 }}>
                    <iframe
                      src={item.url}
                      title={item.text}
                      width="400"
                      height="225"
                      frameBorder="0"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                      style={{ border: '1px solid #ccc' }}
                    />
                  </div>
                )}
                {isAdmin && (
                  <>
                    <button onClick={() => handleEditStart(item)} style={{ marginLeft: 8 }}>수정</button>
                    <button onClick={() => handleDelete(item.id)} style={{ marginLeft: 8, color: 'red' }}>삭제</button>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Video;
