import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/InfoLayout.css";
import "../styles/Works.css";

const TABLE_NAME = "publications";

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
        return [fallback].filter(Boolean);
    }

    return [];
};

const parseArrayField = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.filter(Boolean);
            }
        } catch (err) {
            const trimmed = value.trim();
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) {
                        return parsed.filter(Boolean);
                    }
                } catch (innerErr) {
                    // no-op
                }
            }
        }
    }

    return [];
};

const extractImages = (item) => normalizeImages(item?.images, item?.image);

const extractFiles = (item) => {
    const arrayCandidates = [item?.files, item?.attachments, item?.downloads];
    for (const candidate of arrayCandidates) {
        const parsed = parseArrayField(candidate);
        if (parsed.length) {
            return parsed
                .map((entry) => {
                    if (!entry) return null;
                    if (typeof entry === "string") {
                        return { url: entry, label: "다운로드" };
                    }
                    if (typeof entry === "object") {
                        const url = entry.url || entry.href || entry.path || entry.value;
                        const label = entry.name || entry.label || entry.title || "다운로드";
                        return url ? { url, label } : null;
                    }
                    return null;
                })
                .filter(Boolean);
        }
    }

    const singleUrl =
        item?.file_url ||
        item?.fileUrl ||
        item?.download_url ||
        item?.downloadUrl ||
        item?.file ||
        null;

    if (singleUrl) {
        const label =
            item?.file_name ||
            item?.fileName ||
            item?.download_name ||
            item?.downloadName ||
            "다운로드";

        return [{ url: singleUrl, label }];
    }

    return [];
};

const extractExternalLink = (item) =>
    item?.link || item?.url || item?.external_url || item?.externalUrl || null;

const buildPrimaryText = (item) =>
    item?.title || item?.text || item?.name || item?.headline || "Untitled";

const buildSecondaryLines = (item, primaryText) => {
    const candidates = [
        item?.subtitle,
        item?.text,
        item?.publisher,
        item?.location,
        item?.description,
        item?.summary,
        item?.note,
        item?.author,
        item?.editor,
    ];

    const unique = [];
    candidates.forEach((value) => {
        if (!value) return;
        const trimmed = String(value).trim();
        if (!trimmed || trimmed === primaryText) return;
        if (!unique.includes(trimmed)) {
            unique.push(trimmed);
        }
    });

    return unique;
};

function ImageSlider({ images, onOpen }) {
    const [idx, setIdx] = useState(0);

    if (!images.length) return null;

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
                    alt="publication"
                    onClick={() => onOpen(images, idx)}
                    style={{ cursor: "pointer", maxWidth: "100%" }}
                />
            </div>
            {images.length > 1 && (
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

function PublicationsBase({ wrap = true, showTitle = true }) {
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
                .from(TABLE_NAME)
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
                    images: extractImages(entry),
                    files: extractFiles(entry),
                    externalLink: extractExternalLink(entry),
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

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const yearA = Number(a.year) || 0;
            const yearB = Number(b.year) || 0;
            if (yearA === yearB) {
                return (a.id ?? 0) - (b.id ?? 0);
            }
            return yearB - yearA;
        });
    }, [items]);

    const toggleItem = (key, canExpand) => {
        if (!canExpand) return;
        const normalizedKey = String(key);
        setOpenIds((prev) =>
            prev.includes(normalizedKey)
                ? prev.filter((id) => id !== normalizedKey)
                : [...prev, normalizedKey]
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

    const goPrev = (event) => {
        event.stopPropagation();
        if (!modal) return;
        resetView();
        setModal((current) => ({
            ...current,
            index: (current.index - 1 + current.images.length) % current.images.length,
        }));
    };

    const goNext = (event) => {
        event.stopPropagation();
        if (!modal) return;
        resetView();
        setModal((current) => ({
            ...current,
            index: (current.index + 1) % current.images.length,
        }));
    };

    const handleMouseDown = (event) => {
        event.stopPropagation();
        setDragging(true);
        dragStart.current = {
            x: event.clientX - position.x,
            y: event.clientY - position.y,
        };
    };

    const handleMouseMove = (event) => {
        if (!dragging) return;
        setPosition({
            x: event.clientX - dragStart.current.x,
            y: event.clientY - dragStart.current.y,
        });
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    const handleWheel = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const delta = event.deltaY < 0 ? 0.2 : -0.2;
        setScale((prev) => Math.min(3, Math.max(0.5, prev + delta)));
    };

    const zoomIn = (event) => {
        event.stopPropagation();
        setScale((prev) => Math.min(3, prev + 0.2));
    };

    const zoomOut = (event) => {
        event.stopPropagation();
        setScale((prev) => Math.max(0.5, prev - 0.2));
    };

    const zoomReset = (event) => {
        event.stopPropagation();
        resetView();
    };

    const renderBody = () => {
        const groupedByYear = [];

        sortedItems.forEach((item, index) => {
            const yearLabel = item.year ? String(item.year) : "";
            const groupKey = yearLabel || `unknown-${index}`;
            const itemKey = String(item.id ?? `${groupKey}-${index}`);
            const primaryText = buildPrimaryText(item);
            const secondaryLines = buildSecondaryLines(item, primaryText);
            const attachments = item.files || [];
            const externalLink = item.externalLink;
            const images = item.images || [];
            const hasGallery = images.length > 0;
            const hasAttachments = attachments.length > 0;
            const hasExternalLink = Boolean(externalLink);

            const entry = {
                itemKey,
                primaryText,
                secondaryLines,
                attachments,
                externalLink,
                images,
                canExpand: hasGallery || hasAttachments || hasExternalLink,
                hasGallery,
                hasAttachments,
                hasExternalLink,
            };

            const lastGroup = groupedByYear[groupedByYear.length - 1];
            if (lastGroup && lastGroup.groupKey === groupKey) {
                lastGroup.entries.push(entry);
            } else {
                groupedByYear.push({
                    groupKey,
                    yearLabel,
                    entries: [entry],
                });
            }
        });

        return (
            <div className="info-page">
                {showTitle}
                <ul className="info-record-list">
                    {groupedByYear.map(({ groupKey, yearLabel, entries }) => (
                        <li key={`group-${groupKey}`} className="info-record">
                            <span className="info-record-year">{yearLabel}</span>
                            <div className="info-record-multi">
                                {entries.map((entry) => {
                                    const {
                                        itemKey,
                                        primaryText,
                                        secondaryLines,
                                        attachments,
                                        externalLink,
                                        images,
                                        canExpand,
                                        hasGallery,
                                        hasAttachments,
                                        hasExternalLink,
                                    } = entry;

                                    const isOpen = openIds.includes(itemKey);

                                    return (
                                        <div key={itemKey} className="info-record-line">
                                            <button
                                                type="button"
                                                className="info-record-button"
                                                onClick={() => toggleItem(itemKey, canExpand)}
                                                disabled={!canExpand}
                                            >
                                                <span className="info-record-text">
                                                    <span style={{ display: "block" }}>{primaryText}</span>
                                                    {secondaryLines.length > 0 && (
                                                        <span
                                                            style={{
                                                                display: "block",
                                                                fontSize: "0.85rem",
                                                                color: "#9a9a9a",
                                                                lineHeight: 1.4,
                                                            }}
                                                        >
                                                            {secondaryLines.join(" · ")}
                                                        </span>
                                                    )}
                                                </span>
                                                {canExpand && (
                                                    <span className="info-record-arrow">{isOpen ? "▲" : "▼"}</span>
                                                )}
                                            </button>

                                            {canExpand && (
                                                <div className={`info-record-expand ${isOpen ? "open" : ""}`}>
                                                    <div className="info-record-expand-inner">
                                                        {hasAttachments && (
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    gap: 6,
                                                                }}
                                                            >
                                                                {attachments.map((file, idx) => (
                                                                    <a
                                                                        className="file-download"
                                                                        key={`${itemKey}-file-${idx}`}
                                                                        href={file.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        download
                                                                        style={{ position: "static" }}
                                                                    >
                                                                        DOWNLOAD
                                                                        <i className="ico ico-download"></i>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {hasGallery && (
                                                            <div className="info-record-image">
                                                                <div className="work-image" style={{ marginBottom: 0 }}>
                                                                    <ImageSlider images={images} onOpen={openModal} />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {hasExternalLink && (
                                                            <div>
                                                                <a
                                                                    className="file-download"
                                                                    href={externalLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{ position: "static" }}
                                                                >
                                                                    VIEW LINK
                                                                    <i className="ico ico-download"></i>
                                                                </a>
                                                            </div>
                                                        )}
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
                onClick={(event) => {
                    event.stopPropagation();
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
                    alt="publication"
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
            {loading && !items.length ? (
                <div className="text-muted mb-3">불러오는 중...</div>
            ) : (
                renderBody()
            )}
            {modalOverlay}
        </>
    );
}

export default function PublicationsPage() {
    return <PublicationsBase />;
}

export function PublicationsPreview(props) {
    return <PublicationsBase wrap={false} showTitle={false} {...props} />;
}
