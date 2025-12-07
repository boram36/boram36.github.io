import { useState, useEffect } from "react";
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
        return [fallback];
    }

    return [];
};

export default function AdminBiographyList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("biography")
                .select("*")
                .order("year", { ascending: false })
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

    if (loading) return <div className="p-4">Loading…</div>;
    if (error) return <div className="text-danger">Error: {error}</div>;

    return (
        <div className="container">
            <div className="inner">
                <div className="content_wrap">
                    <div className="d-flex justify-content-end mb-3">
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
                                <th>Year</th>
                                <th>Category</th>
                                <th>Text</th>
                                <th>이미지</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => {
                                const imageArray = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
                                return (
                                    <tr key={item.id}>
                                        <td>{item.year}</td>
                                        <td>{item.category}</td>
                                        <td className="text-break">{item.text}</td>
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
