import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Biography() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase.from("biography").select("*");
      if (error) setError(error.message);
      else setItems(data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className='container'>
      <div className='inner'>
        <h2>Biography</h2>
        {loading && <div>불러오는 중...</div>}
        {error && <div style={{ color: "red" }}>에러: {error}</div>}
        <ul>
          {items.map(item => (
            <li key={item.id}>
              <strong>{item.category}</strong> | <span>{item.year}</span>
              <div>{item.text}</div>
              {item.image && <img src={item.image} alt="bio-img" style={{ width: 120, marginTop: 8, border: "1px solid #ccc" }} />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
