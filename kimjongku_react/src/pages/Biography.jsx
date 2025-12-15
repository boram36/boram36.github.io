import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/InfoLayout.css";
import "../styles/Works.css";

const CATEGORY_ORDER = [
  "One-Person Exhibitions",
  "Group Exhibitions",
  "Residencies",
  "Collection&Commission",
];

const INTRO_LINES = [
  "Chelsea College of Art & Design, M.A., 졸업, 런던",
  "서울대학교 대학원 조각 전공 졸업, 서울",
  "서울대학교 미술대학 조소과 졸업, 서울",
];

const normalizeImages = (rawImages, fallback) => {
  if (Array.isArray(rawImages)) {
    return rawImages.filter(Boolean);
  }

  if (typeof rawImages === "string") {
    try {
      const parsed = JSON.parse(rawImages);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch (err) {
      const trimmed = rawImages.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        return trimmed
          .slice(1, -1)
          .split(",")
          .map((value) => value.trim().replace(/^"|"$/g, ""))
          .filter(Boolean);
      }
    }
  }

  if (fallback) {
    return [fallback];
  }

  return [];
};

const getImages = (item) => {
  return normalizeImages(item?.images, item?.image);
};

function ImageSlider({ images, onOpen }) {
  const [idx, setIdx] = useState(0);

  if (!images.length) return null;

  const goPrev = (e) => {
    e.stopPropagation();
    setIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = (e) => {
    e.stopPropagation();
    setIdx((prev) => (prev + 1) % images.length);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxHeight: 400,
        paddingRight: 46,
      }}
    >
      <div style={{ flex: 1, marginTop: 10 }}>
        <img
          src={images[idx]}
          alt="biography"
          onClick={() => onOpen(images, idx)}
          style={{ cursor: "pointer", maxWidth: "100%" }}
        />
      </div>
      {images.length > 1 && (
        <>
          <button
            className="btn-slide-arr next"
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
            onClick={goNext}
          />
        </>
      )}
    </div>
  );
}

function BiographyBase({ wrap = true, showTitle = true }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openIds, setOpenIds] = useState([]);
  const [modal, setModal] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("biography")
        .select("*")
        .order("year", { ascending: false })
        .order("id", { ascending: true });

      if (!mounted) return;

      if (error) {
        setError(error.message || "데이터를 불러오지 못했습니다.");
        setItems([]);
      } else {
        setError("");
        const normalized = (data || []).map((entry) => ({
          ...entry,
          images: normalizeImages(entry?.images, entry?.image),
        }));
        setItems(normalized);
      }

      setOpenIds([]);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (b.year - a.year) || (a.id - b.id)),
    [items]
  );

  const itemsByCategory = useMemo(() => {
    const grouped = sortedItems.reduce((acc, item) => {
      const key = item.category || "기타";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    const ordered = CATEGORY_ORDER
      .filter((category) => grouped[category]?.length)
      .map((category) => ({ category, items: grouped[category] }));

    const remaining = Object.keys(grouped)
      .filter((category) => !CATEGORY_ORDER.includes(category))
      .sort()
      .map((category) => ({ category, items: grouped[category] }));

    return [...ordered, ...remaining];
  }, [sortedItems]);

  const toggleItem = (item) => {
    const images = getImages(item);
    if (!images.length) return;

    setOpenIds((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id]
    );
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setDragging(false);
  };

  const openModal = (images, index = 0) => {
    if (!images.length) return;
    resetView();
    setModal({ images, index });
  };

  const closeModal = () => {
    resetView();
    setModal(null);
  };

  const goPrev = (e) => {
    e.stopPropagation();
    if (!modal) return;
    resetView();
    setModal((current) => ({
      ...current,
      index: (current.index - 1 + current.images.length) % current.images.length,
    }));
  };

  const goNext = (e) => {
    e.stopPropagation();
    if (!modal) return;
    resetView();
    setModal((current) => ({
      ...current,
      index: (current.index + 1) % current.images.length,
    }));
  };

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setScale((prev) => Math.min(3, Math.max(0.5, prev + delta)));
  };

  const zoomIn = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.min(3, prev + 0.2));
  };

  const zoomOut = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.max(0.5, prev - 0.2));
  };

  const zoomReset = (e) => {
    e.stopPropagation();
    resetView();
  };

  const renderBody = () => {
    return (
      <div className="info-page info-biography">
        {showTitle}
        {wrap && (
          <div className="info-top">
            {INTRO_LINES.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        )}

        {itemsByCategory.map(({ category, items: categoryItems }) => (
          <section key={category} className="info-category-section">
            <h5 className="info-category-title">{category}</h5>
            <ul className="info-record-list">
              {categoryItems.map((item, index) => {
                const images = getImages(item);
                const isOpen = openIds.includes(item.id);
                const showYear = index === 0 || categoryItems[index - 1].year !== item.year;

                return (
                  <li key={item.id} className="info-record">
                    <span
                      className="info-record-year"
                      style={{ visibility: showYear ? "visible" : "hidden" }}
                    >
                      {item.year}
                    </span>
                    <button
                      type="button"
                      className="info-record-button"
                      onClick={() => toggleItem(item)}
                      disabled={!images.length}
                    >

                      <span className="info-record-text">{item.text}</span>
                      {images.length > 0 && (
                        <span className="info-record-arrow">{isOpen ? "▲" : "▼"}</span>
                      )}
                    </button>

                    {isOpen && images.length > 0 && (
                      <div className="info-record-image">
                        <div className="work-image" style={{ marginBottom: 10 }}>
                          <ImageSlider images={images} onOpen={openModal} />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    );
  };

  const modalOverlay = !modal ? null : (
    <div
      className="modal-container"
      onClick={closeModal}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <button
        className="btn-close-modal"
        onClick={(e) => {
          e.stopPropagation();
          closeModal();
        }}
        style={{ position: "absolute", top: 30, right: 40, fontSize: 32 }}
      />

      <button className="btn-slide-arr prev" onClick={goPrev} />
      <button className="btn-slide-arr next" onClick={goNext} />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: "1560px",
          maxHeight: "700px",
          overflow: "hidden",
          cursor: dragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
      >
        <img
          src={modal.images[modal.index]}
          alt="biography"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: dragging ? "none" : "transform 0.15s ease",
            maxWidth: "1560px",
            height: "700px",
            objectFit: "contain",
            userSelect: "none",
            pointerEvents: "none",
          }}
          draggable="false"
        />

        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            display: "flex",
            gap: 8,
            zIndex: 2,
          }}
        >
          <button
            style={{
              fontSize: 22,
              padding: "2px 10px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
            onClick={zoomIn}
            title="확대"
          >
            ＋
          </button>
          <button
            style={{
              fontSize: 22,
              padding: "2px 10px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
            onClick={zoomOut}
            title="축소"
          >
            －
          </button>
          <button
            style={{
              fontSize: 18,
              padding: "2px 10px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
            onClick={zoomReset}
            title="원본"
          >
            원본
          </button>
        </div>
      </div>

      <div className="slide-pagination">
        {modal.index + 1}/{modal.images.length}
      </div>
    </div>
  );

  return (
    <>
      {error && <div className="text-danger mb-3">에러: {error}</div>}
      {renderBody()}
      {modalOverlay}
    </>
  );
}

export default function BiographyPage() {
  return <BiographyBase />;
}

export function BiographyPreview(props) {
  return <BiographyBase wrap={false} showTitle={false} {...props} />;
}
