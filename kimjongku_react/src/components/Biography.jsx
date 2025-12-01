import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ImageModal from './ImageModal';

const categories = [
  'One-Person Exhibitions',
  'Group Exhibitions',
  'Residencies',
  'Collection&Commission',
];

// 샘플 데이터
const initialItems = [
  { id: 1, category: 'One-Person Exhibitions', year: 2024, text: '개인전 설명', image: null },
  { id: 2, category: 'Group Exhibitions', year: 2023, text: '그룹전 설명', image: '/assets/sample2.jpg' },
];

const Biography = ({ isAdmin = false }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase.from('biography').select('*');
      if (error) setError(error.message);
      else setItems(data || initialItems);
      setLoading(false);
    }
    fetchData();
  }, []);

  const [newItem, setNewItem] = useState({ category: categories[0], year: new Date().getFullYear(), text: '', image: null });
  const [editId, setEditId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [zoomImg, setZoomImg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setNewItem({ ...newItem, image: ev.target.result });
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!newItem.text) return;
    setItems([
      { ...newItem, id: Date.now() },
      ...items,
    ]);
    setNewItem({ category: categories[0], year: new Date().getFullYear(), text: '', image: null });
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleEditStart = (item) => {
    setEditId(item.id);
    setEditItem({ ...item });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditItem({ ...editItem, [name]: value });
  };

  const handleEditImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setEditItem({ ...editItem, image: ev.target.result });
      reader.readAsDataURL(file);
    }
  };

  const handleEditSave = () => {
    setItems(items.map(item => item.id === editId ? { ...editItem } : item));
    setEditId(null);
    setEditItem(null);
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditItem(null);
  };

  return (
    <div >
      <h2>Biography</h2>
      {loading && <div>불러오는 중...</div>}
      {error && <div style={{ color: 'red' }}>에러: {error}</div>}
      {!loading && !error && (
        <>
          {isAdmin && (
            <div style={{ marginBottom: '1rem', border: '1px solid #eee', padding: '1rem', borderRadius: 8 }}>
              <select name="category" value={newItem.category} onChange={handleChange}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input type="number" name="year" value={newItem.year} min="1900" max={new Date().getFullYear()} onChange={handleChange} style={{ width: 80, marginLeft: 8 }} />
              <input type="text" name="text" value={newItem.text} onChange={handleChange} placeholder="내용 입력" style={{ marginLeft: 8, width: 200 }} />
              <input type="file" accept="image/*" onChange={handleImage} style={{ marginLeft: 8 }} />
              <button onClick={handleAdd} style={{ marginLeft: 8 }}>추가</button>
            </div>
          )}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[...items].sort((a, b) => b.year - a.year || a.id - b.id).map(item => (
              <li key={item.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                {editId === item.id ? (
                  <div>
                    <select name="category" value={editItem.category} onChange={handleEditChange}>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input type="number" name="year" value={editItem.year} min="1900" max={new Date().getFullYear()} onChange={handleEditChange} style={{ width: 80, marginLeft: 8 }} />
                    <input type="text" name="text" value={editItem.text} onChange={handleEditChange} placeholder="내용 입력" style={{ marginLeft: 8, width: 200 }} />
                    <input type="file" accept="image/*" onChange={handleEditImage} style={{ marginLeft: 8 }} />
                    <button onClick={handleEditSave} style={{ marginLeft: 8 }}>저장</button>
                    <button onClick={handleEditCancel} style={{ marginLeft: 8 }}>취소</button>
                  </div>
                ) : (
                  <div>
                    <strong>{item.category}</strong> | <span>{item.year}</span>
                    <div>{item.text}</div>
                    {item.image && (
                      <img
                        src={item.image}
                        alt="bio-img"
                        style={{ width: 120, marginTop: 8, border: '1px solid #ccc', cursor: 'pointer' }}
                        onClick={() => setZoomImg(item.image)}
                      />
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
          {zoomImg && <ImageModal src={zoomImg} onClose={() => setZoomImg(null)} />}
        </>
      )}
    </div>
  );
};

export default Biography;
