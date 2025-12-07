import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import 'bootstrap/dist/css/bootstrap.min.css';

// DB에 main_bg 테이블(혹은 row)에서 url 관리한다고 가정
// 테이블: main_bg, 컬럼: id(1), url

export default function AdminMainBackground() {
    const [bgUrl, setBgUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const fileInputRef = useRef();

    useEffect(() => {
        // 최초 1회: DB에서 url 불러오기
        const load = async () => {
            const { data, error } = await supabase
                .from("main_bg")
                .select("url")
                .eq("id", 1)
                .single();
            if (data?.url) setBgUrl(data.url);
        };
        load();
    }, []);

    const onImageChange = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        try {
            const file = files[0];
            const ext = file.name.split('.').pop();
            const filePath = `main_bg/bg_${Date.now()}.${ext}`;
            let { error: uploadError } = await supabase.storage.from('images').upload(filePath, file, { upsert: true });
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            if (!data?.publicUrl) throw new Error('이미지 URL 생성 실패');
            // DB에 url 저장
            const { error: dbError } = await supabase
                .from("main_bg")
                .upsert({ id: 1, url: data.publicUrl }, { onConflict: ['id'] });
            if (dbError) throw dbError;
            setBgUrl(data.publicUrl);
            setMessage('배경 이미지가 변경되었습니다!');
        } catch (err) {
            setMessage('업로드 실패: ' + err.message);
        }
        setUploading(false);
    };

    return (
        <div className="container">
            <div className='inner'>
                <div className='content_wrap'>
                    <h3 className="mb-4">메인 배경 이미지 변경</h3>
                    <div className="mb-3">
                        {bgUrl && (
                            <img src={bgUrl} alt="미리보기" style={{ width: '100%', maxWidth: 400, borderRadius: 12, marginBottom: 16 }} />
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onImageChange}
                        ref={fileInputRef}
                        disabled={uploading}
                        className="form-control mb-3"
                    />
                    {uploading && <span style={{ color: '#888' }}>업로드 중...</span>}
                    {message && <div className="mt-3 text-primary">{message}</div>}
                </div>
            </div>
        </div>
    );
}
