import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AdminWorksList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({ title: "", material: "", size: "" });
    const [message, setMessage] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("portfolio_works")
                .select("*")
                .order("year", { ascending: false });
            setItems(data || []);
            setError(error?.message || null);
            setLoading(false);
        };
        load();
    }, []);

    const onEdit = (item) => {
        setEditId(item.id);
        setEditData({ title: item.title, material: item.material, size: item.size });
        setMessage("");
    };

    const onEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const onEditSave = async (id) => {
        const { error } = await supabase
            .from("portfolio_works")
            .update(editData)
            .eq("id", id);
        if (error) {
            setMessage("수정 실패: " + error.message);
        } else {
            setMessage("수정 완료!");
            setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...editData } : it)));
            setEditId(null);
        }
    };

    const onDelete = async (id) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        const { error } = await supabase
            .from("portfolio_works")
            .delete()
            .eq("id", id);
        if (error) {
            setMessage("삭제 실패: " + error.message);
        } else {
            setMessage("삭제 완료!");
            setItems((prev) => prev.filter((it) => it.id !== id));
        }
    };

    if (loading) return <div className="p-4">Loading…</div>;
    if (error) return <div className="text-danger">Error: {error}</div>;

    return (
        <div className="container">
            <div className="inner">
                <h3 className="mb-4">등록된 Works 리스트 (관리자)</h3>
                {message && <div className="mb-3 text-primary">{message}</div>}
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                        <tr>
                            <th>Year</th>
                            <th>Title</th>
                            <th>Material</th>
                            <th>Size</th>
                            <th>이미지</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it) => (
                            <tr key={it.id}>
                                <td>{it.year}</td>
                                <td>
                                    {editId === it.id ? (
                                        <input name="title" value={editData.title} onChange={onEditChange} className="form-control form-control-sm" />
                                    ) : (
                                        it.title
                                    )}
                                </td>
                                <td>
                                    {editId === it.id ? (
                                        <input name="material" value={editData.material} onChange={onEditChange} className="form-control form-control-sm" />
                                    ) : (
                                        it.material
                                    )}
                                </td>
                                <td>
                                    {editId === it.id ? (
                                        <input name="size" value={editData.size} onChange={onEditChange} className="form-control form-control-sm" />
                                    ) : (
                                        it.size
                                    )}
                                </td>
                                <td>
                                    {Array.isArray(it.images) && it.images.length > 0 && (
                                        <img src={it.images[0]} alt="thumb" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                                    )}
                                </td>
                                <td>
                                    {editId === it.id ? (
                                        <>
                                            <button onClick={() => onEditSave(it.id)} className="btn btn-success btn-sm me-2">저장</button>
                                            <button onClick={() => setEditId(null)} className="btn btn-secondary btn-sm">취소</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => onEdit(it)} className="btn btn-primary btn-sm me-2">편집</button>
                                            <button onClick={() => onDelete(it.id)} className="btn btn-danger btn-sm">삭제</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
