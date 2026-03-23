import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "bootstrap/dist/css/bootstrap.min.css";

const TABLE_NAME = "videos";

const extractVideoUrl = (entry) => {
    const candidates = [entry?.video_url, entry?.videoUrl, entry?.url];
    const value = candidates.find((candidate) => typeof candidate === "string" && candidate.trim().length);
    return value ? value.trim() : "";
};

export default function AdminVideoEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const numericId = Number(id);

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
        let mounted = true;

        const loadVideo = async () => {
            setLoading(true);

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select("*")
                .eq("id", id)
                .single();

            if (!mounted) {
                return;
            }

            if (error) {
                setMessage(`불러오기 실패: ${error.message}`);
                setForm(null);
            } else {
                setMessage("");
                setForm({
                    year: data?.year ?? "",
                    text: (data?.text || "").trim(),
                    videoUrl: extractVideoUrl(data),
                });
            }

            setLoading(false);
        };

        loadVideo();

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
        if (!form) {
            return;
        }

        if (!Number.isFinite(numericId)) {
            setMessage("잘못된 데이터 ID입니다.");
            return;
        }

        if (!session) {
            setMessage("로그인이 필요합니다. /admin/login에서 먼저 로그인해주세요.");
            return;
        }

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
                video_url: trimmedVideoUrl,
            };
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .update(payload)
                .eq("id", numericId)
                .select("id, year, text, video_url")
                .maybeSingle();

            if (error) {
                throw new Error(error.message);
            }

            if (!data) {
                throw new Error("수정된 데이터가 없습니다. 권한 또는 대상 데이터를 확인해주세요.");
            }

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

                    {!session && (
                        <div className="alert alert-warning">
                            수정하려면 먼저 관리자 로그인 후 다시 시도해주세요.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mb-4">
                        <div className="mb-3">
                            <label className="form-label">
                                Year<strong style={{ color: "#ff0000" }}>*</strong>
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
                            <label className="form-label">
                                Contents<strong style={{ color: "#ff0000" }}>*</strong>
                            </label>
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
                            <label className="form-label">
                                영상 링크 URL<strong style={{ color: "#ff0000" }}>*</strong>
                            </label>
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
                            <button type="submit" className="btn btn-primary" disabled={saving || !session}>
                                {saving ? "저장 중..." : session ? "저장" : "로그인 필요"}
                            </button>
                        </div>
                    </form>

                    {message && <div className="mt-3 text-primary">{message}</div>}
                </div>
            </div>
        </div>
    );
}
