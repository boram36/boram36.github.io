
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import { supabase, optimizeImageUrl } from "../lib/supabase";
import { DEFAULT_BG } from "../components/MainBackground";

const years = Array.from({ length: 2025 - 1988 + 1 }, (_, i) => 2025 - i);

const CACHE_KEY = "main_bg_url";

export default function Home() {
  const navigate = useNavigate();

  // 캐시된 URL이 있으면 즉시 사용, 없으면 DEFAULT_BG
  const cached = typeof window !== "undefined" ? localStorage.getItem(CACHE_KEY) : null;
  const [bgImage, setBgImage] = useState(cached || DEFAULT_BG);

  useEffect(() => {
    let mounted = true;

    const loadBackground = async () => {
      const { data, error } = await supabase
        .from("main_bg")
        .select("url")
        .eq("id", 1)
        .single();

      if (!mounted) return;

      if (data?.url && !error) {
        const url = optimizeImageUrl(data.url, 1600, 85);
        // 이미지 미리 로드 후에 교체 (깜빡임 방지)
        const img = new Image();
        img.onload = () => {
          if (!mounted) return;
          setBgImage(url);
          localStorage.setItem(CACHE_KEY, url);
        };
        img.src = url;
      }
    };

    loadBackground();

    return () => {
      mounted = false;
    };
  }, []);

  const yearListStyle = {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
  return (
    <div className="container main" style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="inner" style={{ position: 'relative', zIndex: 2 }}>
        <ul className="year-listing" style={yearListStyle}>
          {years.map((year) => (
            <li key={year}>
              <button
                className="year-item"
                onClick={() => navigate(`/works#${year}`)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {year}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
