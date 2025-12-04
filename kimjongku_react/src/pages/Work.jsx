import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Work() {
  const { year } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIds, setOpenIds] = useState([]);
  const [sliderIndex, setSliderIndex] = useState({});
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const loadWorks = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("portfolio_works")
        .select("id, year, title, material, size, images")
        .eq("year", Number(year))
        .order("id", { ascending: true });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      let rows = data || [];
      if (!rows || rows.length === 0) {
        // 폴백: 전체 조회 후 클라이언트 필터
        const { data: all, error: errAll } = await supabase
          .from('portfolio_works')
          .select('id, year, title, material, size, images')
          .order('year', { ascending: false });
        if (errAll) {
          setError(errAll.message);
          setLoading(false);
          return;
        }
        const y = Number(year);
        rows = (all || []).filter(r => r.year === y);
      }
      setItems(rows || []);
      setLoading(false);
    };
    if (year) loadWorks();
  }, [year]);

  return (
    <div className="container">
      <div className="inner">
      {loading && <p>Loading…</p>}
     
      <div>
        {items.map((it) => {
          const isOpen = openIds.includes(it.id);
          const imgs = Array.isArray(it.images) ? it.images : [];
          const idx = sliderIndex[it.id] ?? 0;
          const canPrev = imgs.length > 1 && idx > 0;
          const canNext = imgs.length > 1 && idx < imgs.length - 1;
          return (
            <div key={it.id} style={{ borderBottom: '1px solid #e5e5e5', padding: '16px 0' }}>
              <button
                onClick={() => {
                  setOpenIds((prev) => (isOpen ? prev.filter((id) => id !== it.id) : [...prev, it.id]));
                }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                }}
              >
                <div>
                  <div className="work-top">
                    <span className="work-year">{year}</span>
                    <span className={`work-toggle ${isOpen ? 'open' : 'closed'}`}>
                      <i class="toggle-btn"></i>
                    </span>
                  </div>
                  <div className="work-info">
                    <div>
                      <p className="work-label">(title)</p>
                      <p className="work-title">{it.title}</p>
                    </div>
                    <div>
                      <p className="work-label">(material)</p>
                      <p className="work-material">{it.material}</p>
                    </div>
                    <div>
                      <p className="work-label">(size)</p>
                      <p className="work-size">{it.size}</p>
                    </div>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div style={{ marginTop: 16 }}>
                  {imgs.length === 0 && (
                    <div style={{ color: '#888' }}></div>
                  )}
                  {imgs.length > 0 && (
                    <div style={{ position: 'relative', maxWidth: 920, margin: '0 auto' }}>
                      {imgs.length > 1 && (
                        <>
                          <button
                            aria-label="prev"
                            disabled={!canPrev}
                            onClick={() => setSliderIndex((s) => ({ ...s, [it.id]: Math.max(0, idx - 1) }))}
                            style={{ position: 'absolute', left: -32, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', fontSize: 28, cursor: canPrev ? 'pointer' : 'default', color: '#333' }}
                          >
                            ‹
                          </button>
                          <button
                            aria-label="next"
                            disabled={!canNext}
                            onClick={() => setSliderIndex((s) => ({ ...s, [it.id]: Math.min(imgs.length - 1, idx + 1) }))}
                            style={{ position: 'absolute', right: -32, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', fontSize: 28, cursor: canNext ? 'pointer' : 'default', color: '#333' }}
                          >
                            ›
                          </button>
                        </>
                      )}
                      <img
                        src={imgs[idx]}
                        alt={it.title}
                        style={{ width: '100%', height: 'auto', borderRadius: 8, cursor: 'zoom-in' }}
                        onClick={() => setModalImage(imgs[idx])}
                      />
                      {imgs.length > 1 && (
                        <div style={{ position: 'absolute', right: 0, bottom: -28, color: '#888' }}>
                          {idx + 1} of {imgs.length}
                        </div>
                      )}
                      {imgs.length > 1 && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                          {imgs.map((src, i) => (
                            <img
                              key={src}
                              src={src}
                              alt={`${it.title} ${i + 1}`}
                              style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: i === idx ? '2px solid #333' : '1px solid #ccc', cursor: 'pointer' }}
                              onClick={() => setSliderIndex((s) => ({ ...s, [it.id]: i }))}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
        >
          <img src={modalImage} alt="zoom" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 8 }} />
        </div>
      )}
      </div>
    </div>
  );
}
