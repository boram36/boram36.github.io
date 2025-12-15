import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "bootstrap/dist/css/bootstrap.min.css";

const categories = [
    "One-Person Exhibitions",
    "Group Exhibitions",
    "Residencies",
    "Collection&Commission",
];

const STORAGE_BUCKET = "images";
const STORAGE_FOLDER = "biography";

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

export default function AdminBiographyEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("biography")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                setMessage(`불러오기 실패: ${error.message}`);
            } else {
                const images = normalizeImages(data?.images, data?.image);
                setItem({
                    ...data,
                    images,
                    info: data?.info || "",
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
        ).then((result) => {
            const filtered = result.filter(Boolean);
            if (filtered.length) {
                setNewPreviews((prev) => [...prev, ...filtered]);
            }
        });
    };

    const handleRemoveExistingImage = (target) => {
        setExistingImages((prev) => {
            const next = prev.filter((url) => url !== target);
            setItem((prevItem) => (prevItem ? { ...prevItem, images: next } : prevItem));
            return next;
        });
    };

    const uploadImage = async (file) => {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filename = `bio_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
        const path = `${STORAGE_FOLDER}/${filename}`;

        const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(path, file, {
                upsert: true,
                contentType: file.type || "image/jpeg",
            });

        if (uploadError) throw new Error(uploadError.message);

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        return data?.publicUrl || null;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!item) return;
        setMessage("");

        if (!item.text.trim()) {
            setMessage("내용을 입력해주세요.");
            return;
        }

        setSaving(true);
        try {
            const preserved = existingImages.filter(Boolean);
            let uploadedUrls = [];
            if (imageFiles.length) {
                uploadedUrls = (await Promise.all(imageFiles.map(uploadImage))).filter(Boolean);
            }

            const combined = [...preserved, ...uploadedUrls].filter((url, index, arr) => url && arr.indexOf(url) === index);

            const payload = {
                category: item.category,
                year: Number(item.year),
                text: item.text.trim(),
                image: null,
                images: combined.length ? JSON.stringify(combined) : null,
            };

            const { error } = await supabase.from("biography").update(payload).eq("id", id);
            if (error) throw new Error(error.message);

            setMessage("수정되었습니다.");
            navigate("/admin/biography/list", { replace: true });
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
                            onClick={() => navigate("/admin/biography/list")}
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
                    <div className="">
                        <div className="">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => navigate(-1)}
                                >
                                    뒤로가기
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="">
                                <div className="mb-3">
                                    <label className="form-label">Category</label>
                                    <select
                                        name="category"
                                        value={item.category}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Year</label>
                                    <input
                                        type="number"
                                        name="year"
                                        value={item.year || ""}
                                        min="1900"
                                        max={new Date().getFullYear()}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contents</label>
                                    <input
                                        type="text"
                                        name="text"
                                        value={item.text || ""}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <div className="mb-3">
                                        <span className="d-block text-muted mb-2">Images</span>
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
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Images</label>
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
                                        onClick={() => navigate("/admin/biography/list")}
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
            </div>
        </div>
    );
}
