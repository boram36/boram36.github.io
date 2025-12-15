import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
const DEFAULT_YEAR = 2025;

export default function AdminBiography() {
    const navigate = useNavigate();
    const [newItem, setNewItem] = useState({
        category: categories[0],
        year: DEFAULT_YEAR,
        text: "",
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setNewItem((prev) => ({ ...prev, [name]: value }));
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
                setPreviews((prev) => [...prev, ...filtered]);
            }
        });
    };

    const resetForm = () => {
        setNewItem({
            category: categories[0],
            year: DEFAULT_YEAR,
            text: "",
        });
        setImageFiles([]);
        setPreviews([]);
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
        setMessage("");

        if (!newItem.text.trim()) {
            setMessage("내용을 입력해주세요.");
            return;
        }

        setSubmitting(true);
        try {
            let uploadedUrls = [];
            if (imageFiles.length) {
                uploadedUrls = (await Promise.all(imageFiles.map(uploadImage))).filter(Boolean);
            }

            const payload = {
                category: newItem.category,
                year: Number(newItem.year),
                text: newItem.text.trim(),
                image: null,
                images: uploadedUrls.length ? JSON.stringify(uploadedUrls) : null,
            };

            const { error } = await supabase.from("biography").insert(payload);
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
                    <div className="mb-4">
                        <div className="">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex gap-2">
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
                                        onClick={() => navigate("/admin/biography/list")}
                                    >
                                        목록 관리
                                    </button>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit} className="">
                                <div className="mb-3">
                                    <label className="form-label">Category</label>
                                    <select
                                        name="category"
                                        value={newItem.category}
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
                                        value={newItem.year}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Text</label>
                                    <input
                                        type="text"
                                        name="text"
                                        value={newItem.text}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="한 줄 소개를 입력해주세요."
                                        required
                                    />
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
                                </div>
                                {previews.length > 0 && (
                                    <div className="mb-3">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => {
                                                setImageFiles([]);
                                                setPreviews([]);
                                            }}
                                        >
                                            추가 이미지 초기화
                                        </button>
                                    </div>
                                )}
                                <div className="d-flex flex-wrap gap-3">
                                    {previews.map((src, index) => (
                                        <div key={index} className="mb-2">
                                            <span className="d-block text-muted mb-1">미리보기 {index + 1}</span>
                                            <img
                                                src={src}
                                                alt="미리보기"
                                                className="img-thumbnail"
                                                style={{ maxWidth: 160 }}
                                            />
                                        </div>
                                    ))}
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
            </div>
        </div>
    );
}
