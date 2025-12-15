import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "bootstrap/dist/css/bootstrap.min.css";

const TABLE_NAME = "videos";

export default function AdminVideoEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select("*")
                .eq("id", id)
                .single();

            if (!mounted) return;

            if (error) {
                setMessage(`불러오기 실패: ${error.message}`);
                setForm(null);
            } else {
                setMessage("");
                setForm({
                    year: data?.year ?? "",
                    text: (data?.text || data?.title || "").trim(),
                    videoUrl: (data?.video_url || data?.videoUrl || data?.url || "").trim(),
                });
            }

            setLoading(false);
        })();

        return () => {
            mounted = false;
        };
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!form) return;
        setMessage("");

        const trimmedText = form.text.trim();
        const trimmedVideoUrl = form.videoUrl.trim();
        if (!trimmedText || !trimmedVideoUrl) {
            setMessage("필수 항목을 모두 입력해주세요.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                year: Number(form.year) || null,
                text: trimmedText,
                title: trimmedText,
                video_url: trimmedVideoUrl,
            };

            const { error } = await supabase.from(TABLE_NAME).update(payload).eq("id", id);
            if (error) throw new Error(error.message);

            setMessage("수정되었습니다.");
            navigate("/admin/video/list", { replace: true });
        } catch (err) {
            setMessage(`수정 실패: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="inner">
                    <div className="content_wrap">불러오는 중...</div>
                </div>
            </div>
        );
    }

    if (!form) {
        return (
            <div className="container">
                <div className="inner">
                    <div className="content_wrap">
                        <div className="alert alert-danger">데이터를 찾을 수 없습니다.</div>
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => navigate("/admin/video/list")}
                        >
                            목록으로 이동
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="inner">
                <div className="content_wrap">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => navigate(-1)}
                        >
                            뒤로가기
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => navigate("/admin/video/list")}
                        >
                            목록 관리
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mb-4">
                        <div className="mb-3">
                            <label className="form-label">
                                Year<strong style={{ color: '#ff0000' }}>*</strong>
                            </label>
                            <input
                                type="number"
                                className="form-control"
                                name="year"
                                value={form.year ?? ""}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Contents<strong style={{ color: '#ff0000' }}>*</strong></label>
                            <input
                                type="text"
                                className="form-control"
                                name="text"
                                value={form.text}
                                onChange={handleChange}
                                placeholder="내용을 입력해주세요."
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">영상 링크 URL<strong style={{ color: '#ff0000' }}>*</strong></label>
                            <input
                                type="url"
                                className="form-control"
                                name="videoUrl"
                                value={form.videoUrl}
                                onChange={handleChange}
                                placeholder="https://"
                                required
                            />
                        </div>

                        <div className="d-grid d-md-flex justify-content-md-end">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "저장 중..." : "저장"}
                            </button>
                        </div>
                    </form>

                    {message && <div className="mt-3 text-primary">{message}</div>}
                </div>
            </div>
        </div>
    );
}
