import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "bootstrap/dist/css/bootstrap.min.css";

const DEFAULT_YEAR = new Date().getFullYear();
const TABLE_NAME = "videos";

export default function AdminVideo() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        year: DEFAULT_YEAR,
        text: "",
        videoUrl: "",
    });
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm({
            year: DEFAULT_YEAR,
            text: "",
            videoUrl: "",
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        const trimmedText = form.text.trim();
        const trimmedVideoUrl = form.videoUrl.trim();
        if (!trimmedText || !trimmedVideoUrl) {
            setMessage("필수 항목을 모두 입력해주세요.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                year: Number(form.year) || null,
                text: trimmedText,
                video_url: trimmedVideoUrl,
            };

            const { error } = await supabase.from(TABLE_NAME).insert(payload);
            if (error) throw new Error(error.message);

            setMessage("등록되었습니다.");
            resetForm();
        } catch (err) {
            setMessage(`등록 실패: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container">
            <div className="inner">
                <div className="content_wrap">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex gap-2">
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                                뒤로가기
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => navigate("/admin/video/list")}
                            >
                                리스트 관리
                            </button>
                        </div>
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => navigate("/admin")}
                        >
                            관리자 홈
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
                                value={form.year}
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
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? "등록 중..." : "등록"}
                            </button>
                        </div>
                    </form>

                    {message && <div className="mt-3 text-primary">{message}</div>}
                </div>
            </div>
        </div>
    );
}
