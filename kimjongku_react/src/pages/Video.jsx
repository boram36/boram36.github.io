import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/InfoLayout.css";
import "../styles/Works.css";

const TABLE_NAME = "videos";

const extractText = (entry) => {
    const base = (entry?.text || entry?.title || "").trim();
    return base;
};

const extractVideoUrl = (entry) => {
    const candidates = [entry?.video_url, entry?.videoUrl, entry?.url];
    const value = candidates.find((candidate) => typeof candidate === "string" && candidate.trim().length);
    return value ? value.trim() : "";
};

const getEmbedInfo = (rawUrl) => {
    const url = (rawUrl || "").trim();
    if (!url) return { type: "none", url: "" };

    const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    if (youtubeMatch) {
        return { type: "iframe", url: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
    }

    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
        return { type: "iframe", url: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
    }

    const directMatch = url.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
    if (directMatch) {
        return { type: "video", url };
    }

    return { type: "link", url };
};

function VideoEmbed({ videoUrl }) {
    const embedInfo = getEmbedInfo(videoUrl);

    if (embedInfo.type === "iframe") {
        return (
            <div
                style={{
                    position: "relative",
                    paddingBottom: "56.25%",
                    height: 0,
                    overflow: "hidden",
                    maxHeight: "500px",
                }}
            >
                <iframe
                    src={embedInfo.url}
                    title="video-player"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{
                        border: "none",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                    }}
                />
            </div>
        );
    }

    if (embedInfo.type === "video") {
        return (
            <video
                controls
                style={{ width: "100%", maxWidth: 720, display: "block", margin: "0 auto" }}
                src={embedInfo.url}
            >
                <track kind="captions" src="" label="" />
            </video>
        );
    }

    if (embedInfo.type === "link") {
        return (
            <a
                href={embedInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: "inline-block",
                    marginTop: 12,
                    padding: "10px 18px",
                    borderRadius: 999,
                    border: "1px solid #1f2937",
                    color: "#1f2937",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                }}
            >
                영상 링크 열기
            </a>
        );
    }

    return <div className="text-muted">등록된 영상 링크가 없습니다.</div>;
}

export default function VideoPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openIds, setOpenIds] = useState([]);

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
                    text: extractText(entry),
                    videoUrl: extractVideoUrl(entry),
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

    const renderBody = () => {
        const groupedByYear = [];

        sortedItems.forEach((item, index) => {
            const yearLabel = item.year ? String(item.year) : "";
            const groupKey = yearLabel || `unknown-${index}`;
            const itemKey = String(item.id ?? `${groupKey}-${index}`);
            const hasVideo = item.videoUrl.length > 0;
            const displayText = item.text || "내용 없음";

            const entry = {
                itemKey,
                hasVideo,
                displayText,
                videoUrl: item.videoUrl,
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
                <ul className="info-record-list">
                    {groupedByYear.map(({ groupKey, yearLabel, entries }) => (
                        <li key={`group-${groupKey}`} className="info-record">
                            <span className="info-record-year">{yearLabel}</span>
                            <div className="info-record-multi">
                                {entries.map(({ itemKey, hasVideo, displayText, videoUrl }) => {
                                    const isOpen = openIds.includes(itemKey);

                                    return (
                                        <div key={itemKey} className="info-record-line">
                                            <button
                                                type="button"
                                                className="info-record-button"
                                                onClick={() => toggleItem(itemKey, hasVideo)}
                                                disabled={!hasVideo}
                                            >
                                                <span className="info-record-text">
                                                    <span style={{ display: "block" }}>{displayText}</span>
                                                </span>
                                                {hasVideo && (
                                                    <span className="info-record-arrow">{isOpen ? "▲" : "▼"}</span>
                                                )}
                                            </button>

                                            {hasVideo && (
                                                <div className={`info-record-expand ${isOpen ? "open" : ""}`}>
                                                    <div className="info-record-expand-inner">
                                                        <div className="info-record-image" style={{ width: "100%" }}>
                                                            <VideoEmbed videoUrl={videoUrl} />
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
            </div>
        );
    };

    if (loading && !items.length) {
        return <div className="text-muted mb-3">불러오는 중...</div>;
    }

    return (
        <>
            {error && <div className="text-danger mb-3">에러: {error}</div>}
            {renderBody()}
        </>
    );
}