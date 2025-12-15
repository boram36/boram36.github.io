import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "bootstrap/dist/css/bootstrap.min.css";

const TABLE_NAME = "videos";

const extractText = (entry) => (entry?.text || entry?.title || "").trim();
const extractVideoUrl = (entry) => {
    const candidates = [entry?.video_url, entry?.videoUrl, entry?.url];
    const value = candidates.find((candidate) => typeof candidate === "string" && candidate.trim().length);
    return value ? value.trim() : "";
};

export default function AdminVideoList() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select("*")
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

    const handleDelete = async (id) => {
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
                        <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => navigate("/admin/video")}
                        >
                            등록
                        </button>
                    </div>
                    {message && <div className="mb-3 text-primary">{message}</div>}
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: "120px" }}>년도</th>
                                <th>내용</th>
                                <th style={{ width: "220px" }}>영상 링크</th>
                                <th style={{ width: "160px" }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
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
                                            onClick={() => navigate(`/admin/video/edit/${item.id}`)}
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
