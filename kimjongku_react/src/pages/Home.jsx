
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import { supabase } from "../lib/supabase";
import { DEFAULT_BG } from "../components/MainBackground";

const years = Array.from({ length: 2025 - 1988 + 1 }, (_, i) => 2025 - i);

export default function Home() {
  const navigate = useNavigate();
  const [bgImage, setBgImage] = useState(DEFAULT_BG);

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
        setBgImage(data.url);
      } else {
        setBgImage(DEFAULT_BG);
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
        <div className="info-copyright">© Kim Jongku. All rights reserved.</div>
      </div>
    </div>
  );
}
