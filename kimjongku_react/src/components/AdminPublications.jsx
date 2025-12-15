import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "bootstrap/dist/css/bootstrap.min.css";

const STORAGE_BUCKET = "images";
const IMAGE_FOLDER = "publications/images";
const FILE_FOLDER = "publications/files";
const DEFAULT_YEAR = new Date().getFullYear();

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

export default function AdminPublications() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        year: DEFAULT_YEAR,
        title: "",
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [attachment, setAttachment] = useState(null);
    const [attachmentPreview, setAttachmentPreview] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageSelect = async (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = "";
        if (!files.length) return;

        setImageFiles((prev) => [...prev, ...files]);
        const previews = await Promise.all(files.map(readFileAsDataURL));
        const valid = previews.filter(Boolean);
        if (valid.length) {
            setImagePreviews((prev) => [...prev, ...valid]);
        }
    };

    const handleAttachmentSelect = (event) => {
        const file = event.target.files?.[0] || null;
        event.target.value = "";
        setAttachment(file);
        setAttachmentPreview(file ? file.name : "");
    };

    const resetForm = () => {
        setForm({
            year: DEFAULT_YEAR,
            title: "",
        });
        setImageFiles([]);
        setImagePreviews([]);
        setAttachment(null);
        setAttachmentPreview("");
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
            imageFiles.map((file) => uploadToStorage(file, IMAGE_FOLDER, "publication-img", "image/jpeg"))
        );
        return uploads.filter(Boolean);
    };

    const uploadAttachment = async () => {
        if (!attachment) return null;
        const url = await uploadToStorage(attachment, FILE_FOLDER, "publication-file", "application/octet-stream");
        return {
            url,
            label: attachment.name || "파일 다운로드",
        };
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        if (!form.title.trim()) {
            setMessage("내용을 입력해주세요.");
            return;
        }

        setSubmitting(true);
        try {
            const [imageUrls, attachmentMeta] = await Promise.all([
                uploadImages(),
                uploadAttachment(),
            ]);

            const attachments = attachmentMeta ? [attachmentMeta] : [];

            const payload = {
                year: Number(form.year),
                title: form.title.trim(),
                image: imageUrls[0] || null,
                images: imageUrls.length ? JSON.stringify(imageUrls) : null,
                files: attachments.length ? JSON.stringify(attachments) : null,
                file_url: attachments[0]?.url || null,
                file_name: attachments[0]?.label || null,
            };

            const { error } = await supabase.from("publications").insert(payload);
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
                                onClick={() => navigate("/admin/publications/list")}
                            >
                                목록 관리
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
                                Year
                            </label>
                            <input
                                type="number"
                                name="year"
                                value={form.year}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Contents <strong style={{ color: '#ff0000' }}>*</strong></label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="내용을 입력해주세요."
                                required
                            />
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
                        </div>

                        {imagePreviews.length > 0 && (
                            <div className="mb-3">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => {
                                        setImageFiles([]);
                                        setImagePreviews([]);
                                    }}
                                >
                                    추가 이미지 초기화
                                </button>
                                <div className="d-flex flex-wrap gap-3 mt-3">
                                    {imagePreviews.map((src, index) => (
                                        <div key={index} className="text-center">
                                            <span className="d-block text-muted mb-1">이미지 {index + 1}</span>
                                            <img src={src} alt={`preview-${index}`} className="img-thumbnail" style={{ maxWidth: 160 }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label">Attachments</label>
                            <input
                                type="file"
                                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleAttachmentSelect}
                                className="form-control"
                            />
                            {attachmentPreview && (
                                <div className="d-flex align-items-center gap-2 mt-2">
                                    <span className="text-muted">선택된 파일: {attachmentPreview}</span>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => {
                                            setAttachment(null);
                                            setAttachmentPreview("");
                                        }}
                                    >
                                        제거
                                    </button>
                                </div>
                            )}
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
