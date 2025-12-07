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

const STORAGE_BUCKET = "images";
const STORAGE_FOLDER = "works";

export default function AdminWorksEdit({ id, onDone }) {
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [form, setForm] = useState({ title: "", material: "", size: "" });
    const [existingImages, setExistingImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("portfolio_works")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                setMessage(`불러오기 실패: ${error.message}`);
            } else if (data) {
                const normalized = normalizeImages(data.images, data.image);
                setItem(data);
                setForm({
                    title: data.title || "",
                    material: data.material || "",
                    size: data.size || "",
                });
                setExistingImages(normalized);
            }

            setLoading(false);
        };

        if (id) {
            load();
        }
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImage = (event) => {
        const input = event.target;
        const files = Array.from(input.files || []);
        input.value = "";
        if (!files.length) {
            return;
        }

        setImageFiles((prev) => [...prev, ...files]);

        Promise.all(
            files.map(
                (file) =>
                    new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (ev) => resolve(ev.target?.result || "");
                        reader.readAsDataURL(file);
                    })
            )
        ).then((results) => {
            const filtered = results.filter(Boolean);
            if (filtered.length) {
                setNewPreviews((prev) => [...prev, ...filtered]);
            }
        });
    };

    const handleRemoveExistingImage = (target) => {
        setExistingImages((prev) => prev.filter((url) => url !== target));
    };

    const uploadImage = async (file) => {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filename = `work_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
        const path = `${STORAGE_FOLDER}/${filename}`;

        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });

        if (error) throw new Error(error.message);

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        return data?.publicUrl || null;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!item) return;

        setSaving(true);
        setMessage("");

        try {
            const preserved = existingImages.filter(Boolean);
            let uploaded = [];
            if (imageFiles.length) {
                uploaded = (await Promise.all(imageFiles.map(uploadImage))).filter(Boolean);
            }

            const combined = [...preserved, ...uploaded].filter((url, index, arr) => url && arr.indexOf(url) === index);

            const payload = {
                title: form.title.trim(),
                material: form.material.trim(),
                size: form.size.trim(),
                images: combined.length ? combined : null,
            };

            const { error } = await supabase
                .from("portfolio_works")
                .update(payload)
                .eq("id", id);

            if (error) throw new Error(error.message);

            setMessage("수정되었습니다.");
            if (typeof onDone === "function") {
                onDone();
            }
            navigate("/admin/works/list", { replace: true });
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

    if (!item) {
        return (
            <div className="container">
                <div className="inner">
                    <div className="content_wrap">
                        <div className="alert alert-danger">데이터를 찾을 수 없습니다.</div>
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => navigate("/admin/works/list")}
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
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Material</label>
                            <input
                                type="text"
                                name="material"
                                value={form.material}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Size</label>
                            <input
                                type="text"
                                name="size"
                                value={form.size}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <span className="d-block text-muted mb-2">등록된 이미지</span>
                            {existingImages.length ? (
                                <div className="d-flex flex-wrap gap-3">
                                    {existingImages.map((url, index) => (
                                        <div key={url} className="position-relative">
                                            <img
                                                src={url}
                                                alt={`기존 이미지 ${index + 1}`}
                                                className="img-thumbnail"
                                                style={{ maxWidth: 160 }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm mt-2 w-100"
                                                onClick={() => handleRemoveExistingImage(url)}
                                            >
                                                제거
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-muted">등록된 이미지가 없습니다.</div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">이미지 추가</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImage}
                                className="form-control"
                            />
                            {newPreviews.length > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm mt-2"
                                    onClick={() => {
                                        setImageFiles([]);
                                        setNewPreviews([]);
                                    }}
                                >
                                    추가 이미지 초기화
                                </button>
                            )}
                            {newPreviews.length > 0 && (
                                <div className="d-flex flex-wrap gap-3 mt-3">
                                    {newPreviews.map((src, index) => (
                                        <div key={index} className="mb-2">
                                            <span className="d-block text-muted mb-1">추가 이미지 {index + 1}</span>
                                            <img
                                                src={src}
                                                alt="새 이미지 미리보기"
                                                className="img-thumbnail"
                                                style={{ maxWidth: 160 }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="col-12 d-grid d-md-flex justify-content-md-end gap-2">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate("/admin/works/list")}
                                disabled={saving}
                            >
                                목록으로 이동
                            </button>
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
