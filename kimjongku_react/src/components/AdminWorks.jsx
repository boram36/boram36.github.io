import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminWorks() {
  const [session, setSession] = useState(null);
  const [year, setYear] = useState(2025);
  const [existingYears, setExistingYears] = useState([]);
  const [title, setTitle] = useState("");
  const [material, setMaterial] = useState("");
  const [size, setSize] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    init();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 기존 등록된 연도 목록 불러오기
  useEffect(() => {
    const loadYears = async () => {
      const { data, error } = await supabase
        .from('portfolio_works')
        .select('year')
        .order('year', { ascending: false });
      if (!error && data) {
        const uniq = Array.from(new Set(data.map(d => d.year))).filter(y => typeof y === 'number');
        setExistingYears(uniq);
      }
    };
    loadYears();
  }, []);

  const onFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const uploadImages = async () => {
    const bucket = "works"; // 미리 생성된 Storage 버킷 이름
    const urls = [];
    for (const file of files) {
      // 파일명 클린징: 한글/공백/특수문자 문제로 Invalid key 발생 가능
      const originalName = file.name || 'file';
      const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
      const ext = extMatch ? extMatch[1].toLowerCase() : (file.type.split('/')[1] || 'dat');
      const base = originalName
        .replace(/\.[^.]+$/, '') // 확장자 제거
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-') // 허용외 문자 -> -
        .replace(/-+/g, '-') // 중복 - 정리
        .replace(/^-|-$/g, '') // 앞뒤 - 제거
        .slice(0, 40) || 'img';
      const safeName = `${base}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const path = `${year}/${safeName}`; // 경로 내 한글/공백 제거된 안전한 이름
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: false,
        contentType: file.type || "image/jpeg",
      });
      if (upErr) throw new Error(`이미지 업로드 실패: ${upErr.message}`);
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      urls.push(pub.publicUrl);
    }
    return urls;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      setMessage("로그인이 필요합니다. /admin/login으로 이동하세요.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      console.log("[AdminWorks] 현재 세션:", session);
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
      <h3>Works 업로드 (관리자)</h3>
      <form onSubmit={onSubmit}>
        {/* {existingYears.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <label>Year 선택</label><br />
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">년도 선택...</option>
              {existingYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )} */}
        <div style={{ marginBottom: 12 }}>
          <label>Year</label><br />
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Title</label><br />
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Material</label><br />
          <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Size</label><br />
          <input type="text" value={size} onChange={(e) => setSize(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Images</label><br />
          <input type="file" multiple accept="image/*" onChange={onFileChange} />
        </div>
        <button type="submit" disabled={submitting || !session}>
          {submitting ? "업로드 중…" : session ? "등록" : "로그인 필요"}
        </button>
      </form>
      {message && <p style={{ marginTop: 12 }}>{message}</p>}
      <p style={{ marginTop: 8, fontSize: 12, color: '#888' }}>세션 상태: {session ? '활성 (' + session.user.email + ')' : '없음'}</p>
      <p style={{ marginTop: 16, color: "#666" }}>
        참고: Storage 버킷 "works" (public) 와 테이블 정책 (select: anon, insert: authenticated) 확인. RLS 오류시 정책 재확인.
      </p>
    </div>
      </div>
  );
}
