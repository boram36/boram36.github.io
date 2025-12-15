import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

    const navigate = useNavigate();

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
                                <th style={{ width: "120px" }}>Year</th>
                                <th>Title</th>
                                <th style={{ width: "180px" }}>Material</th>
                                <th style={{ width: "160px" }}>Size</th>
                                <th>Image</th>
                                <th>Manage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it) => (
                                <tr key={it.id}>
                                    <td>{it.year}</td>
                                    <td>{it.title}</td>
                                    <td>{it.material}</td>
                                    <td>{it.size}</td>
                                    <td>
                                        {Array.isArray(it.images) && it.images.length > 0 && (
                                            <img src={it.images[0]} alt="thumb" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                                        )}
                                    </td>
                                    <td>
                                        <button onClick={e => { e.stopPropagation(); navigate(`/admin/works/edit/${it.id}`); }} className="btn btn-primary btn-sm me-2">편집</button>
                                        <button onClick={e => { e.stopPropagation(); onDelete(it.id); }} className="btn btn-danger btn-sm">삭제</button>
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
