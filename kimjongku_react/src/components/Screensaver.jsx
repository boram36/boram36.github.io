import { useEffect, useState } from "react";
import "../styles/Screensaver.css";
import { supabase } from "../lib/supabase";

const STORAGE_BUCKETS = ["works"];
const MAX_IMAGES = 80;

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

// -------------------- 컴포넌트 --------------------
export default function Screensaver({ onExit }) {
  const [images, setImages] = useState([]);

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

      // DB 이미지가 너무 적으면 Storage에서도 보충
      if (collected.size < MAX_IMAGES / 2) {
        const storageUrls = await loadFromStorage();
        storageUrls.forEach((url) => collected.add(url));
      }

      const finalImages = Array.from(collected).slice(0, MAX_IMAGES);
      setImages(finalImages);
    };

    loadImages();
    return () => {
      mounted = false;
    };
  }, []);

  const handleExit = () => {
    if (typeof onExit === "function") onExit();
  };

  const handleOverlayClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleExit();
  };

  const hasSlides = images.length > 0;
  const slidesCount = hasSlides ? images.length : 1;

  // ✅ 1회만 재생되도록 길이 기반 duration 계산
  const animationDuration = `${Math.min(
    Math.max(slidesCount * 3.5, 20),
    60
  )}s`;

  return (
    <div
      className="screensaver-wrap"
      onClick={handleOverlayClick}
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
            className="screensaver-track once"
            style={{ "--screensaver-duration": animationDuration }}
            onAnimationEnd={handleExit}
          >
            {images.map((src, idx) => (
              <div key={`${idx}-${src}`} className="screensaver-slide">
                <img src={src} alt="screensaver" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------- Storage 보조 로딩 --------------------
async function loadFromStorage() {
  const accumulator = new Set();

  const traverseBucket = async (bucket, prefix = "") => {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      console.warn(
        `Screensaver: storage list failed (${bucket}/${prefix}):`,
        error.message
      );
      return;
    }

    for (const item of data || []) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      const isFile = item.metadata && typeof item.metadata.size === "number";

      if (isFile) {
        const { data: publicInfo } =
          supabase.storage.from(bucket).getPublicUrl(path);
        const url = publicInfo?.publicUrl;

        if (typeof url === "string" && url.startsWith("http")) {
          accumulator.add(url);
        }
        if (accumulator.size >= MAX_IMAGES) return;
      } else {
        await traverseBucket(bucket, path);
        if (accumulator.size >= MAX_IMAGES) return;
      }
    }
  };

  for (const bucket of STORAGE_BUCKETS) {
    await traverseBucket(bucket, "");
    if (accumulator.size >= MAX_IMAGES) break;
  }

  return Array.from(accumulator);
}
