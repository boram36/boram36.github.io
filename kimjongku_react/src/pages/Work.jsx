import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Work() {
  const { year } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWorks = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("portfolio_works")
        .select("id, title, material, size, images")
        .eq("year", Number(year))
        .order("id", { ascending: true });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setItems(data || []);
      setLoading(false);
    };
    if (year) loadWorks();
  }, [year]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Works for {year}</h2>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && items.length === 0 && (
        <p>해당 연도의 등록된 작품이 없습니다.</p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {items.map((it) => (
          <div key={it.id} style={{ border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
            {Array.isArray(it.images) && it.images.length > 0 ? (
              <img src={it.images[0]} alt={it.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>No Image</div>
            )}
            <div style={{ padding: '12px' }}>
              <div style={{ fontWeight: 600 }}>{it.title}</div>
              <div style={{ color: '#555' }}>{it.material}</div>
              <div style={{ color: '#555' }}>{it.size}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
