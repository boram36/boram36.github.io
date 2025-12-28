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

  if (!Array.isArray(images) || images.length === 0) return null;

  const hasMultiple = images.length > 1;

  const goPrev = (event) => {
    event.stopPropagation();
    setIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = (event) => {
    event.stopPropagation();
    setIdx((prev) => (prev + 1) % images.length);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxHeight: 400,
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
      {hasMultiple && (
        <>
          <button
            className="btn-slide-arr prev"
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
            onClick={goPrev}
          />
          <button
            className="btn-slide-arr next"
            style={{
              position: "absolute",
              right: 10,
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

  const toggleItem = (key, canExpand) => {
    if (!canExpand) return;

    setOpenIds((prev) =>
      prev.includes(key)
        ? prev.filter((id) => id !== key)
        : [...prev, key]
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
    const sections = itemsByCategory.map(({ category, items: categoryItems }) => {
      const groupedByYear = [];

      categoryItems.forEach((item, index) => {
        const groupKey = item.year != null ? String(item.year) : `unknown-${index}`;
        const itemKey = item?.id != null ? String(item.id) : `${category}-${index}`;
        const images = getImages(item);

        const entry = {
          item,
          itemKey,
          images,
        };

        const lastGroup = groupedByYear[groupedByYear.length - 1];
        if (lastGroup && lastGroup.groupKey === groupKey) {
          lastGroup.entries.push(entry);
        } else {
          groupedByYear.push({
            groupKey,
            yearLabel: item.year,
            entries: [entry],
          });
        }
      });

      return (
        <section key={category} className="info-category-section">
          <h5 className="info-category-title">{category}</h5>
          <ul className="info-record-list">
            {groupedByYear.map(({ groupKey, yearLabel, entries }) => (
              <li key={`${category}-${groupKey}`} className="info-record">
                <span className="info-record-year">{yearLabel}</span>
                <div className="info-record-multi">
                  {entries.map(({ item, itemKey, images }) => {
                    const isOpen = openIds.includes(itemKey);
                    const hasGallery = images.length > 0;
                    const canExpand = hasGallery;

                    return (
                      <div key={itemKey} className="info-record-line">
                        <button
                          type="button"
                          className="info-record-button"
                          onClick={() => toggleItem(itemKey, canExpand)}
                          disabled={!canExpand}
                        >
                          <span className="info-record-text">{item.text}</span>
                          {canExpand && (
                            <span className="info-record-arrow">{isOpen ? "▲" : "▼"}</span>
                          )}
                        </button>

                        {canExpand && (
                          <div className={`info-record-expand ${isOpen ? "open" : ""}`}>
                            <div className="info-record-expand-inner">
                              <div className="info-record-image">
                                <div className="work-image" style={{ marginBottom: 10 }}>
                                  <ImageSlider images={images} onOpen={openModal} />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        </section>
      );
    });



    return (
      <div className="info-page info-biography">
        {INTRO_LINES.length > 0 && (
          <div className="info-top">
            {INTRO_LINES.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        )}
        {sections}
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

      {modal.images.length > 1 && (
        <>
          <button className="btn-slide-arr prev" onClick={goPrev} />
          <button className="btn-slide-arr next" onClick={goNext} />
        </>
      )}

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
            <i className="icon-reset"></i>
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
