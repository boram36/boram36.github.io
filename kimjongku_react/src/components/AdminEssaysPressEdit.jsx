import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "bootstrap/dist/css/bootstrap.min.css";

const STORAGE_BUCKET = "images";
const IMAGE_FOLDER = "essays_press/images";
const FILE_FOLDER = "essays_press/files";

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

export default function AdminEssaysPressEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [existingImages, setExistingImages] = useState([]);
    const [existingFiles, setExistingFiles] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [newAttachment, setNewAttachment] = useState(null);
    const [newAttachmentName, setNewAttachmentName] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("essays_press")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                setMessage(`불러오기 실패: ${error.message}`);
            } else if (data) {
                const images = normalizeImages(data.images, data.image);
                const files = normalizeFiles(data.files || data.attachments || data.downloads);
                setItem({
                    ...data,
                    title: data.title || "",
                });
                setExistingImages(images);
                setExistingFiles(files);
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
            setItem((current) =>
                current
                    ? {
                        ...current,
                        image: next[0] || null,
                        images: next,
                    }
                    : current
            );
            return next;
        });
    };

    const handleAttachmentSelect = (event) => {
        const file = event.target.files?.[0] || null;
        event.target.value = "";
        setNewAttachment(file);
        setNewAttachmentName(file ? file.name : "");
    };

    const handleRemoveExistingFile = (target) => {
        setExistingFiles((prev) => {
            const next = prev.filter((file) => file.url !== target);
            setItem((current) => (current ? { ...current, files: next } : current));
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
            imageFiles.map((file) => uploadToStorage(file, IMAGE_FOLDER, "essay-img", "image/jpeg"))
        );
        return uploads.filter(Boolean);
    };

    const uploadAttachment = async () => {
        if (!newAttachment) return null;
        const url = await uploadToStorage(newAttachment, FILE_FOLDER, "essay-file", "application/octet-stream");
        return {
            url,
            label: newAttachment.name || "파일 다운로드",
        };
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!item) return;
        setMessage("");

        if (!item.title.trim()) {
            setMessage("제목을 입력해주세요.");
            return;
        }

        setSaving(true);
        try {
            const [uploadedImages, uploadedAttachment] = await Promise.all([
                uploadImages(),
                uploadAttachment(),
            ]);

            const preservedImages = existingImages.filter(Boolean);
            const combinedImages = [...uploadedImages, ...preservedImages].filter(
                (url, index, arr) => url && arr.indexOf(url) === index
            );

            const preservedFiles = existingFiles.filter((file) => file && file.url);
            const attachments = uploadedAttachment
                ? [uploadedAttachment, ...preservedFiles]
                : [...preservedFiles];

            const payload = {
                year: Number(item.year),
                title: item.title.trim(),
                image: combinedImages[0] || null,
                images: combinedImages.length ? JSON.stringify(combinedImages) : null,
                files: attachments.length ? JSON.stringify(attachments) : null,
                file_url: attachments[0]?.url || null,
                file_name: attachments[0]?.label || null,
            };

            const { error } = await supabase.from("essays_press").update(payload).eq("id", id);
            if (error) throw new Error(error.message);

            setMessage("수정되었습니다.");
            navigate("/admin/essays/list", { replace: true });
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
                            onClick={() => navigate("/admin/essays/list")}
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
                            onClick={() => navigate("/admin/essays/list")}
                        >
                            목록으로 이동
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="mb-4">
                        <div className="mb-3">
                            <label className="form-label">Year</label>
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
                            <label className="form-label">Contents</label>
                            <input
                                type="text"
                                name="title"
                                value={item.title || ""}
                                onChange={handleChange}
                                className="form-control"
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
                            <label className="form-label">Images</label>
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
                        <div className="mb-4">
                            <span className="d-block text-muted mb-2">Attachments</span>
                            {existingFiles.length ? (
                                <div className="d-flex flex-column gap-2">
                                    {existingFiles.map((file) => (
                                        <div key={file.url} className="d-flex align-items-center gap-2">
                                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                {file.label || file.url}
                                            </a>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleRemoveExistingFile(file.url)}
                                            >
                                                제거
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-muted">등록된 첨부 파일이 없습니다.</div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Attachments</label>
                            <input
                                type="file"
                                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleAttachmentSelect}
                                className="form-control"
                            />
                            {newAttachmentName && (
                                <div className="d-flex align-items-center gap-2 mt-2">
                                    <span className="text-muted">선택된 파일: {newAttachmentName}</span>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => {
                                            setNewAttachment(null);
                                            setNewAttachmentName("");
                                        }}
                                    >
                                        제거
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="col-12 d-grid d-md-flex justify-content-md-end gap-2">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate("/admin/essays/list")}
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
