import { useEffect, useState } from "react";
import "../styles/Screensaver.css";
import { supabase, optimizeImageUrl } from "../lib/supabase";

const SCREENSAVER_IMAGE_LIMIT = 20;

// -------------------- 이미지 파싱 유틸 --------------------
const parseImages = (raw) => {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.flatMap((value) => {
      if (typeof value === "string") return value.trim() ? [value.trim()] : [];
      if (value && typeof value === "object") {
        return Object.values(value).filter(
          (entry) => typeof entry === "string" && entry.trim().length > 0
        );
      }
      return [];
    });
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
      if (parsed && typeof parsed === "object") {
        return Object.values(parsed).filter(
          (value) => typeof value === "string" && value.trim().length > 0
        );
      }
    } catch (err) { }
    return raw.trim().length ? [raw.trim()] : [];
  }

  if (typeof raw === "object") {
    return Object.values(raw).filter(
      (value) => typeof value === "string" && value.trim().length > 0
    );
  }

  return [];
};

const normalizeEntryImages = (entry) => {
  return parseImages(entry?.images).filter(Boolean);
};

const pickRandomImages = (urls, limit) => {
  const copy = [...urls];

  // Fisher-Yates shuffle for unbiased random selection each run.
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, Math.min(limit, copy.length));
};

// -------------------- 컴포넌트 --------------------
export default function Screensaver({ onExit }) {
  const [images, setImages] = useState([]);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadImages = async () => {
      const { data, error } = await supabase
        .from("portfolio_works")
        .select("images")
        .order("year", { ascending: false })
        .order("id", { ascending: true });

      if (!mounted) return;

      if (error) {
        console.warn("Screensaver load error:", error.message);
        setImages([]);
        return;
      }

      const collected = new Set();

      (data || []).forEach((entry) => {
        normalizeEntryImages(entry).forEach((url) => {
          if (typeof url === "string" && url.startsWith("http")) {
            collected.add(url);
          }
        });
      });

      const randomImages = pickRandomImages(
        Array.from(collected),
        SCREENSAVER_IMAGE_LIMIT
      );

      const finalImages = randomImages.map((url) =>
        optimizeImageUrl(url, 1200, 80)
      );
      setImages(finalImages);
    };

    loadImages();
    return () => {
      mounted = false;
    };
  }, []);

  const handleExit = () => {
    if (!exiting) setExiting(true);
  };

  const handleWrapAnimEnd = () => {
    if (exiting && typeof onExit === "function") onExit();
  };

  const handleOverlayClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleExit();
  };

  const hasSlides = images.length > 0;
  const slidesCount = hasSlides ? images.length : 1;

  // 무한 루프: 이미지 2배 복제 후 translateX(-50%)로 seamless 반복 (클릭 시에만 종료)
  const animationDuration = `${Math.max(slidesCount * 6, 60)}s`;
  const loopedImages = [...images, ...images];

  return (
    <div
      className={`screensaver-wrap${exiting ? " exiting" : ""}`}
      onClick={handleOverlayClick}
      onAnimationEnd={handleWrapAnimEnd}
      onKeyDown={(event) => {
        if (["Enter", " ", "Escape"].includes(event.key)) {
          event.preventDefault();
          event.stopPropagation();
          handleExit();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {hasSlides && (
        <div className="screensaver-marquee">
          <div
            className="screensaver-track"
            style={{ "--screensaver-duration": animationDuration }}
          >
              {loopedImages.map((src, idx) => (
              <div key={idx} className="screensaver-slide">
                <img
                  src={src}
                  alt="screensaver"
                  loading="eager"
                />
              </div>
            ))}
          </div>
          </div>
        )}
    </div>
  );
}
