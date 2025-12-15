import { useEffect, useState } from "react";
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

export default function AdminEssaysPressList() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("essays_press")
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

        const { error } = await supabase
            .from("essays_press")
            .delete()
            .eq("id", id);

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
                        <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => navigate("/admin/essays")}
                        >
                            등록
                        </button>
                    </div>
                    {message && <div className="mb-3 text-primary">{message}</div>}
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: "100px" }}>Year</th>
                                <th style={{ width: "220px" }}>Contents</th>
                                <th style={{ width: "180px" }}>Attachments</th>
                                <th style={{ width: "140px" }}>Images</th>
                                <th style={{ width: "140px" }}>Manage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => {
                                const imageArray = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
                                const fileArray = Array.isArray(item.files) ? item.files : [];
                                const primaryFile = fileArray[0];
                                const extraFileCount = fileArray.length > 1 ? fileArray.length - 1 : 0;
                                const linkHref = item.link || item.externalLink || item.external_url || item.url || "";
                                return (
                                    <tr key={item.id}>
                                        <td>{item.year}</td>
                                        <td className="text-break">{item.title}</td>
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
                                                onClick={() => navigate(`/admin/essays/edit/${item.id}`)}
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
