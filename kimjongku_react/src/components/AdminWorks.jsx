import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { uploadImageToCloudinary } from "../lib/cloudinary";

export default function AdminWorks() {
  const [year, setYear] = useState(2025);
  const [title, setTitle] = useState("");
  const [material, setMaterial] = useState("");
  const [size, setSize] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const onFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const uploadImages = () => Promise.all(files.map((file) => uploadImageToCloudinary(file, "works")));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const imageUrls = files.length ? await uploadImages() : [];
      const { error: insertError } = await supabase.from("portfolio_works").insert({
        year: Number(year),
        title,
        material,
        size,
        images: imageUrls,
      });
      if (insertError) throw new Error(insertError.message);
      setMessage("등록 완료!");
      setYear(2025);
      setTitle("");
      setMaterial("");
      setSize("");
      setFiles([]);
    } catch (err) {
      setMessage(`오류: ${err.message}`);
      console.error("[AdminWorks] Insert 실패", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="inner">
        <div className='content_wrap'>
          <h3 className="mb-4">Works 업로드 (관리자)</h3>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                      뒤로가기
                  </button>
                  <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => navigate("/admin/works/list")}
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
          <form onSubmit={onSubmit} className="mb-3">
            {/* {existingYears.length > 0 && (
          <div className="mb-3">
            <label className="form-label">Year 선택</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="form-select">
              <option value="">년도 선택...</option>
              {existingYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )} */}
            <div className="mb-3">
              <label className="form-label">Year</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} required className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">Material</label>
              <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} required className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">Size</label>
              <input type="text" value={size} onChange={(e) => setSize(e.target.value)} className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">Images</label>
              <input type="file" multiple accept="image/*" onChange={onFileChange} className="form-control" />
            </div>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "업로드 중…" : "등록"}
            </button>
          </form>
          {message && <p className="mt-3 text-primary">{message}</p>}
          {/* <p className="mt-2 text-muted" style={{ fontSize: 12 }}>세션 상태: {session ? '활성 (' + session.user.email + ')' : '없음'}</p>
        <p className="mt-4 text-secondary">
          참고: Storage 버킷 "works" (public) 와 테이블 정책 (select: anon, insert: authenticated) 확인. RLS 오류시 정책 재확인.
        </p> */}
        </div>
      </div>
    </div>
  );
}
