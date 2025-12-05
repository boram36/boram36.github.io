import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AdminWorksEdit({ id, onDone }) {
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [form, setForm] = useState({ title: "", material: "", size: "" });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("portfolio_works")
                .select("*")
                .eq("id", id)
                .single();
            if (data) {
                setItem(data);
                setForm({ title: data.title, material: data.material, size: data.size });
            }
            setLoading(false);
        };
        if (id) load();
    }, [id]);

    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const onSave = async (e) => {
        e.preventDefault();
        const { error } = await supabase
            .from("portfolio_works")
            .update(form)
            .eq("id", id);
        if (error) {
            setMessage("수정 실패: " + error.message);
        } else {
            setMessage("수정 완료!");
            if (onDone) onDone();
        }
    };

    if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
    if (!item) return <div style={{ color: "red" }}>데이터 없음</div>;

    return (
        <div className="container">
            <div className="inner">
                <h3>Works 편집 (관리자)</h3>
                <form onSubmit={onSave}>
                    <div style={{ marginBottom: 12 }}>
                        <label>Title</label><br />
                        <input name="title" value={form.title} onChange={onChange} required />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label>Material</label><br />
                        <input name="material" value={form.material} onChange={onChange} required />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label>Size</label><br />
                        <input name="size" value={form.size} onChange={onChange} required />
                    </div>
                    <button type="submit">저장</button>
                </form>
                {message && <div style={{ marginTop: 12, color: '#0070f3' }}>{message}</div>}
            </div>
        </div>
    );
}
