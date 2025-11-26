import { useState } from "react";
import { supabase } from "../lib/supabase";
import "./Admin.css";

export default function AdminUpload() {
    const [formData, setFormData] = useState({
        year: "",
        title: "",
        description: "",
        category: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);


    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setUploading(true);

        let imageUrl = null;

        try {
            // 1️⃣ 이미지 파일이 있을 때만 업로드 실행
            if (imageFile) {
                const cleanFileName = imageFile.name
                    .replace(/[^\w.-]/g, "") // 한글, 특수문자 제거
                    .replace(/\s+/g, "-"); // 공백 → 하이픈 처리

                const fileName = `${Date.now()}-${cleanFileName}`;

                // 🔹 Storage 업로드
                const { data: uploadData, error: uploadError } =
                    await supabase.storage.from("portfolio-images").upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                // 🔹 Public URL 가져오기
                imageUrl = supabase.storage
                    .from("portfolio-images")
                    .getPublicUrl(fileName).data.publicUrl;
            }

            // 2️⃣ DB Insert (works 테이블에 저장)
            const { data, error } = await supabase.from("works").insert([
                {
                    year: formData.year,
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    image: imageUrl,
                },
            ]);

            if (error) throw error;

            alert("업로드 성공!");
            setFormData({ year: "", title: "", description: "", category: "" });
            setImageFile(null);

        } catch (error) {
            console.error("업로드 중 오류:", error);
            alert("업로드 실패: " + error.message);
        }

        setUploading(false);
    }

    return (
        <div className="admin-wrap">
            <h2>Admin 작품 업로드</h2>

            <form className="admin-form" onSubmit={handleSubmit}>
                <select name="year" onChange={handleChange} value={formData.year} required>
                    <option value="">연도 선택</option>
                    {Array.from({ length: 2025 - 1996 + 1 }, (_, i) => 2025 - i).map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>

                <input name="title" placeholder="제목" onChange={handleChange} required />
                <textarea name="description" placeholder="설명" onChange={handleChange} required />
                <input name="category" placeholder="카테고리" onChange={handleChange} />

                <input type="file" onChange={(e) => setImageFile(e.target.files[0])} accept="image/*" />

                <button type="submit" disabled={uploading}>
                    {uploading ? "업로드 중..." : "업로드"}
                </button>
            </form>
        </div>
    );
}


