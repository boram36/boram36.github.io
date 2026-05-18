import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "bootstrap/dist/css/bootstrap.min.css";

const TABLE_NAME = "videos";

const extractText = (entry) => (entry?.text || "").trim();
const extractVideoUrl = (entry) => {
    const candidates = [entry?.video_url, entry?.videoUrl, entry?.url];
    const value = candidates.find((candidate) => typeof candidate === "string" && candidate.trim().length);
    return value ? value.trim() : "";
};

export default function AdminVideoList() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");
    const [orderChanged, setOrderChanged] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dragOverIdx, setDragOverIdx] = useState(null);
    const dragIdx = useRef(null);

    useEffect(() => {
        const initSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
        };

        initSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select("*")
                .order("sort_order", { ascending: true, nullsFirst: false })
                .order("year", { ascending: false })
                .order("id", { ascending: true });

            if (error) {
                setError(error.message);
                setItems([]);
            } else {
                setError(null);
                const normalized = (data || []).map((entry) => ({
                    ...entry,
                    text: extractText(entry),
                    videoUrl: extractVideoUrl(entry),
                }));
                setItems(normalized);
            }

            setLoading(false);
        };

        load();
    }, []);

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
                    supabase.from(TABLE_NAME).update({ sort_order: idx + 1 }).eq("id", item.id).select("id")
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

    const handleDelete = async (id) => {
        if (!session) {
            setMessage("로그인이 필요합니다. /admin/login에서 먼저 로그인해주세요.");
            return;
        }

        if (!window.confirm("삭제하시겠습니까?")) return;

        const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
        if (error) {
            setMessage(`삭제 실패: ${error.message}`);
        } else {
            setItems((prev) => prev.filter((item) => item.id !== id));
            setMessage("삭제 완료!");
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
                            onClick={() => navigate("/admin/video")}
                        >
                            등록
                        </button>
                    </div>
                    {!session && <div className="alert alert-warning">편집/삭제하려면 관리자 로그인이 필요합니다.</div>}
                    {message && <div className="mb-3 text-primary">{message}</div>}
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: "32px" }}></th>
                                <th style={{ width: "120px" }}>년도</th>
                                <th>내용</th>
                                <th style={{ width: "220px" }}>영상 링크</th>
                                <th style={{ width: "160px" }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
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
                                    <td className="text-break">{item.text || "-"}</td>
                                    <td className="text-break">
                                        {item.videoUrl ? (
                                            <a href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                                                {item.videoUrl}
                                            </a>
                                        ) : (
                                            <span className="text-muted">URL 없음</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/video/edit/${item.id}`); }}
                                            className="btn btn-primary btn-sm me-2"
                                            disabled={!session}
                                        >
                                            편집
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                            className="btn btn-danger btn-sm"
                                            disabled={!session}
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
