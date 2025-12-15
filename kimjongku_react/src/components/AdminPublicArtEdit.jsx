import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "bootstrap/dist/css/bootstrap.min.css";

const STORAGE_BUCKET = "images";
const IMAGE_FOLDER = "public_art/images";

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

const sanitizeFileName = (name, fallback) => {
    if (!name) return fallback;
    const withoutExt = name.replace(/\.[^.]+$/, "");
    const cleaned = withoutExt
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    return cleaned || fallback;
};

const buildStoragePath = (folder, file, prefix) => {
    const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
    const mimeExt = file.type.split("/")[1];
    const ext = extMatch ? extMatch[1].toLowerCase() : mimeExt || "dat";
    const safe = sanitizeFileName(file.name, prefix);
    return `${folder}/${safe}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
};

const readFileAsDataURL = (file) =>
    new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result || "");
        reader.readAsDataURL(file);
    });

export default function AdminPublicArtEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [existingImages, setExistingImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("public_art")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                setMessage(`불러오기 실패: ${error.message}`);
            } else if (data) {
                const images = normalizeImages(data.images, data.image);
                setItem({
                    ...data,
                    text: data.text || data.title || "",
                    images,
                });
                setExistingImages(images);
            }
            setLoading(false);
        })();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setItem((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const handleImageSelect = async (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = "";
        if (!files.length) return;

        setImageFiles((prev) => [...prev, ...files]);
        const previews = await Promise.all(files.map(readFileAsDataURL));
        const valid = previews.filter(Boolean);
        if (valid.length) {
            setNewPreviews((prev) => [...prev, ...valid]);
        }
    };

    const handleRemoveExistingImage = (target) => {
        setExistingImages((prev) => {
            const next = prev.filter((url) => url !== target);
            setItem((current) => (current ? { ...current, images: next, image: next[0] || null } : current));
            return next;
        });
    };

    const uploadToStorage = async (file, folder, defaultPrefix, contentTypeFallback) => {
        const path = buildStoragePath(folder, file, defaultPrefix);
        const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(path, file, {
                upsert: true,
                contentType: file.type || contentTypeFallback,
            });

        if (uploadError) throw new Error(uploadError.message);

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        if (!data?.publicUrl) throw new Error("파일 URL을 가져오지 못했습니다.");
        return data.publicUrl;
    };

    const uploadImages = async () => {
        if (!imageFiles.length) return [];
        const uploads = await Promise.all(
            imageFiles.map((file) => uploadToStorage(file, IMAGE_FOLDER, "public-art-img", "image/jpeg"))
        );
        return uploads.filter(Boolean);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!item) return;
        setMessage("");

        if (!item.text || !item.text.trim()) {
            setMessage("내용을 입력해주세요.");
            return;
        }

        setSaving(true);
        try {
            const uploadedImages = await uploadImages();
            const preservedImages = existingImages.filter(Boolean);
            const combinedImages = [...uploadedImages, ...preservedImages].filter(
                (url, index, arr) => url && arr.indexOf(url) === index
            );

            const trimmedText = item.text.trim();

            const payload = {
                year: Number(item.year) || null,
                text: trimmedText,
                title: trimmedText,
                image: combinedImages[0] || null,
                images: combinedImages.length ? JSON.stringify(combinedImages) : null,
            };

            const { error } = await supabase.from("public_art").update(payload).eq("id", id);
            if (error) throw new Error(error.message);

            setMessage("수정되었습니다.");
            navigate("/admin/public-art/list", { replace: true });
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
                            onClick={() => navigate("/admin/public-art/list")}
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
                            onClick={() => navigate("/admin/public-art/list")}
                        >
                            목록으로 이동
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mb-4">
                        <div className="mb-3">
                            <label className="form-label">
                                년도 선택 (최신이 제일 위로 올라오게, 같은 년도면 처음 입력한 내용이 제일 상단)
                            </label>
                            <input
                                type="number"
                                name="year"
                                value={item.year || ""}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">(내용) 텍스트 입력 *</label>
                            <input
                                type="text"
                                name="text"
                                value={item.text || ""}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="내용을 입력해주세요."
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <span className="d-block text-muted mb-2">등록된 이미지</span>
                            {existingImages.length ? (
                                <div className="d-flex flex-wrap gap-3">
                                    {existingImages.map((url, idx) => (
                                        <div key={url} className="position-relative">
                                            <img
                                                src={url}
                                                alt={`기존 이미지 ${idx + 1}`}
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
                                onChange={handleImageSelect}
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
                        </div>

                        {newPreviews.length > 0 && (
                            <div className="mb-3">
                                <span className="d-block text-muted mb-2">업로드 예정 이미지</span>
                                <div className="d-flex flex-wrap gap-3">
                                    {newPreviews.map((src, index) => (
                                        <div key={index} className="text-center">
                                            <img src={src} alt={`preview-${index}`} className="img-thumbnail" style={{ maxWidth: 160 }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
