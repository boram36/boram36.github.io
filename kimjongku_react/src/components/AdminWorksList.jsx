import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, optimizeImageUrl } from "../lib/supabase";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AdminWorksList() {
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
                .from("portfolio_works")
                .select("id, year, title, material, size, sort_order, images")
                .order("year", { ascending: false })
                .order("sort_order", { ascending: true, nullsFirst: false });
            setItems(data || []);
            setError(error?.message || null);
            setLoading(false);
        };
        load();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        const { error } = await supabase.from("portfolio_works").delete().eq("id", id);
        if (error) {
            setMessage("삭제 실패: " + error.message);
        } else {
            setMessage("삭제 완료!");
            setItems((prev) => prev.filter((it) => it.id !== id));
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
                    supabase.from("portfolio_works").update({ sort_order: idx + 1 }).eq("id", item.id).select("id")
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
                <div className='content_wrap'>
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
                            onClick={() => navigate("/admin/works")}
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
                                <th>Title</th>
                                <th style={{ width: "180px" }}>Material</th>
                                <th style={{ width: "160px" }}>Size</th>
                                <th>Image</th>
                                <th>Manage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it, idx) => (
                                <tr
                                    key={it.id}
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
                                    <td>{it.year}</td>
                                    <td>{it.title}</td>
                                    <td>{it.material}</td>
                                    <td>{it.size}</td>
                                    <td>
                                        {Array.isArray(it.images) && it.images.length > 0 && (
                                            <img src={optimizeImageUrl(it.images[0], 80, 70)} alt="thumb" loading="lazy" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                                        )}
                                    </td>
                                    <td>
                                        <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/works/edit/${it.id}`); }} className="btn btn-primary btn-sm me-2">편집</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(it.id); }} className="btn btn-danger btn-sm">삭제</button>
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
