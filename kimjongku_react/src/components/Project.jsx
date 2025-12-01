import React, { useState } from 'react';

// 샘플 데이터
const initialItems = [
  { id: 1, year: 2025, material: '철', size: '100x200cm', text: '프로젝트 설명', image: null },
  { id: 2, year: 2024, material: '', size: '', text: '프로젝트 내용', image: '/assets/sample6.jpg' },
];

function Project({ isAdmin = false }) {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState({ year: new Date().getFullYear(), material: '', size: '', text: '', image: null });
  const [editId, setEditId] = useState(null);
  const [editItem, setEditItem] = useState(null);

  // 최신순 정렬
  const sortedItems = [...items].sort((a, b) => b.year - a.year || a.id - b.id);

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  // 이미지 업로드
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setNewItem({ ...newItem, image: ev.target.result });
      reader.readAsDataURL(file);
    }
  };

  // 추가
  const handleAdd = () => {
    if (!newItem.text) return;
    setItems([
      { ...newItem, id: Date.now() },
      ...items,
    ]);
    setNewItem({ year: new Date().getFullYear(), material: '', size: '', text: '', image: null });
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

  // 수정 이미지 업로드
  const handleEditImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setEditItem({ ...editItem, image: ev.target.result });
      reader.readAsDataURL(file);
    }
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
      <h2>Project</h2>
      {isAdmin && (
        <div style={{ marginBottom: '1rem', border: '1px solid #eee', padding: '1rem', borderRadius: 8 }}>
          <input type="number" name="year" value={newItem.year} min="1900" max={new Date().getFullYear()} onChange={handleChange} style={{ width: 80 }} />
          <input type="text" name="material" value={newItem.material} onChange={handleChange} placeholder="재료(material)" style={{ marginLeft: 8, width: 120 }} />
          <input type="text" name="size" value={newItem.size} onChange={handleChange} placeholder="사이즈(size)" style={{ marginLeft: 8, width: 120 }} />
          <input type="text" name="text" value={newItem.text} onChange={handleChange} placeholder="내용 입력" style={{ marginLeft: 8, width: 200 }} />
          <input type="file" accept="image/*" onChange={handleImage} style={{ marginLeft: 8 }} />
          <button onClick={handleAdd} style={{ marginLeft: 8 }}>추가</button>
        </div>
      )}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sortedItems.map(item => (
          <li key={item.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            {editId === item.id ? (
              <div>
                <input type="number" name="year" value={editItem.year} min="1900" max={new Date().getFullYear()} onChange={handleEditChange} style={{ width: 80 }} />
                <input type="text" name="material" value={editItem.material} onChange={handleEditChange} placeholder="재료(material)" style={{ marginLeft: 8, width: 120 }} />
                <input type="text" name="size" value={editItem.size} onChange={handleEditChange} placeholder="사이즈(size)" style={{ marginLeft: 8, width: 120 }} />
                <input type="text" name="text" value={editItem.text} onChange={handleEditChange} placeholder="내용 입력" style={{ marginLeft: 8, width: 200 }} />
                <input type="file" accept="image/*" onChange={handleEditImage} style={{ marginLeft: 8 }} />
                <button onClick={handleEditSave} style={{ marginLeft: 8 }}>저장</button>
                <button onClick={handleEditCancel} style={{ marginLeft: 8 }}>취소</button>
              </div>
            ) : (
              <div>
                <span>{item.year}</span>
                <div>{item.text}</div>
                {item.material && <div>재료: {item.material}</div>}
                {item.size && <div>사이즈: {item.size}</div>}
                {item.image && <img src={item.image} alt="project-img" style={{ width: 120, marginTop: 8, border: '1px solid #ccc' }} />}
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

export default Project;
