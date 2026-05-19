import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "bootstrap/dist/css/bootstrap.min.css";

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
                    return [];
                }
            }
        }
    }

    return [];
};

const normalizeFiles = (raw) => {
    const parsed = parseArrayField(raw);
    return parsed
        .map((entry) => {
            if (!entry) return null;
            if (typeof entry === "string") {
                return { url: entry, label: "파일" };
            }
            if (typeof entry === "object") {
                const url = entry.url || entry.href || entry.path || entry.value;
                const label = entry.name || entry.label || entry.title || "파일";
                return url ? { url, label } : null;
            }
            return null;
        })
        .filter(Boolean);
};

export default function AdminPublicationsList() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");
    const [orderChanged, setOrderChanged] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dragOverIdx, setDragOverIdx] = useState(null);
    const dragIdx = useRef(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("publications")
                .select("*")
                .order("year", { ascending: false })
                .order("sort_order", { ascending: true, nullsFirst: false })
                .order("id", { ascending: true });

            if (error) {
                setItems([]);
                setError(error.message);
            } else {
                setError(null);
                const normalized = (data || []).map((entry) => ({
                    ...entry,
                    images: normalizeImages(entry?.images, entry?.image),
                    files: normalizeFiles(entry?.files || entry?.attachments || entry?.downloads),
                }));
                setItems(normalized);
            }

            setLoading(false);
        };

        load();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        const { error } = await supabase.from("publications").delete().eq("id", id);
        if (error) {
            setMessage(`삭제 실패: ${error.message}`);
        } else {
            setItems((prev) => prev.filter((item) => item.id !== id));
            setMessage("삭제 완료!");
        }
    };

    const handleDragStart = (e, idx) => {
        dragIdx.current = idx;
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnter = (idx) => {
        if (dragIdx.current === null || dragIdx.current === idx) return;
        const from = dragIdx.current;
        dragIdx.current = idx;
        setDragOverIdx(idx);
        setItems((prev) => {
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(idx, 0, moved);
            return next;
        });
        setOrderChanged(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragEnd = () => {
        dragIdx.current = null;
        setDragOverIdx(null);
    };

    const handleSaveOrder = async () => {
        setSaving(true);
        setMessage("");
        try {
            const results = await Promise.all(
                items.map((item, idx) =>
                    supabase.from("publications").update({ sort_order: idx + 1 }).eq("id", item.id).select("id")
                )
            );
            const failed = results.find((r) => r.error);
            if (failed) throw new Error(failed.error.message);
            const blocked = results.find((r) => !r.data || r.data.length === 0);
            if (blocked) throw new Error("권한 없음: Supabase RLS UPDATE 정책을 확인해주세요.");
            setMessage("순서가 저장되었습니다.");
            setOrderChanged(false);
        } catch (err) {
            setMessage("순서 저장 실패: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4">Loading…</div>;
    if (error) return <div className="text-danger">Error: {error}</div>;

    return (
        <div className="container">
            <div className="inner">
                <div className="content_wrap">
                    <div className="d-flex justify-content-end mb-3 gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => navigate("/admin")}
                        >
                            관리자 홈
                        </button>
                        {orderChanged && (
                            <button
                                type="button"
                                className="btn btn-warning btn-sm"
                                onClick={handleSaveOrder}
                                disabled={saving}
                            >
                                {saving ? "저장 중..." : "순서 저장"}
                            </button>
                        )}
                        <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => navigate("/admin/publications")}
                        >
                            등록
                        </button>
                    </div>
                    {message && <div className="mb-3 text-primary">{message}</div>}
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: "32px" }}></th>
                                <th style={{ width: "120px" }}>년도</th>
                                <th>내용</th>
                                <th style={{ width: "180px" }}>첨부</th>
                                <th style={{ width: "160px" }}>이미지</th>
                                <th style={{ width: "160px" }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => {
                                const imageArray = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
                                const fileArray = Array.isArray(item.files) ? item.files : [];
                                const primaryFile = fileArray[0];
                                const extraFileCount = fileArray.length > 1 ? fileArray.length - 1 : 0;
                                return (
                                    <tr
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx)}
                                        onDragEnter={() => handleDragEnter(idx)}
                                        onDragOver={handleDragOver}
                                        onDragEnd={handleDragEnd}
                                        style={{
                                            opacity: dragIdx.current === idx ? 0.4 : 1,
                                            background: dragOverIdx === idx ? "#e8f4ff" : undefined,
                                            cursor: "grab",
                                        }}
                                    >
                                        <td style={{ textAlign: "center", color: "#aaa", fontSize: "1.1rem", userSelect: "none" }}>⠿</td>
                                        <td>{item.year}</td>
                                        <td className="text-break">{item.title || "-"}</td>
                                        <td className="text-break">
                                            {primaryFile ? (
                                                <>
                                                    <a href={primaryFile.url} target="_blank" rel="noopener noreferrer">
                                                        {primaryFile.label || "파일"}
                                                    </a>
                                                    {extraFileCount > 0 && (
                                                        <span className="ms-2 text-muted">+{extraFileCount}</span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-muted">첨부 없음</span>
                                            )}
                                        </td>
                                        <td>
                                            {imageArray.length > 0 ? (
                                                <>
                                                    <img
                                                        src={imageArray[0]}
                                                        alt="thumb"
                                                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                                                    />
                                                    {imageArray.length > 1 && (
                                                        <span className="ms-2 text-muted">+{imageArray.length - 1}</span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-muted">이미지 없음</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => navigate(`/admin/publications/edit/${item.id}`)}
                                                className="btn btn-primary btn-sm me-2"
                                            >
                                                편집
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="btn btn-danger btn-sm"
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
