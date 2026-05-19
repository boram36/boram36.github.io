import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, optimizeImageUrl } from "../lib/supabase";
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
        return [fallback];
    }

    return [];
};

export default function AdminBiographyList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");
    const [orderChanged, setOrderChanged] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dragOverIdx, setDragOverIdx] = useState(null);
    const dragIdx = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("biography")
                .select("id, year, category, text, sort_order, images, image")
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
                }));
                setItems(normalized);
            }

            setLoading(false);
        };

        load();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        const { error } = await supabase
            .from("biography")
            .delete()
            .eq("id", id);

        if (error) {
            setMessage("삭제 실패: " + error.message);
        } else {
            setMessage("삭제 완료!");
            setItems((prev) => prev.filter((item) => item.id !== id));
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
                    supabase
                        .from("biography")
                        .update({ sort_order: idx + 1 })
                        .eq("id", item.id)
                        .select("id")
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
                            onClick={() => navigate("/admin/biography")}
                        >
                            등록
                        </button>
                    </div>
                    {message && <div className="mb-3 text-primary">{message}</div>}
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: "32px" }}></th>
                                <th style={{ width: "120px" }}>Year</th>
                                <th style={{ width: "140px" }}>Category</th>
                                <th>Contents</th>
                                <th>Images</th>
                                <th>Manage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => {
                                const imageArray = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
                                const isDragging = dragIdx.current === idx;
                                const isOver = dragOverIdx === idx;
                                return (
                                    <tr
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx)}
                                        onDragEnter={() => handleDragEnter(idx)}
                                        onDragOver={handleDragOver}
                                        onDragEnd={handleDragEnd}
                                        style={{
                                            opacity: isDragging ? 0.4 : 1,
                                            background: isOver ? "#e8f4ff" : undefined,
                                            cursor: "grab",
                                        }}
                                    >
                                        <td
                                            style={{
                                                textAlign: "center",
                                                color: "#aaa",
                                                fontSize: "1.1rem",
                                                userSelect: "none",
                                            }}
                                        >
                                            ⠿
                                        </td>
                                        <td>{item.year}</td>
                                        <td>{item.category}</td>
                                        <td className="text-break">{item.text}</td>
                                        <td>
                                            {imageArray.length > 0 ? (
                                                <>
                                                    <img
                                                        src={optimizeImageUrl(imageArray[0], 80, 70)}
                                                        alt="thumb"
                                                        loading="lazy"
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/admin/biography/edit/${item.id}`);
                                                }}
                                                className="btn btn-primary btn-sm me-2"
                                            >
                                                편집
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item.id);
                                                }}
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
