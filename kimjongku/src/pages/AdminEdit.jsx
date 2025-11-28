import { supabase } from "../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [work, setWork] = useState(null);

    useEffect(() => {
        fetchWork();
    }, []);

    async function fetchWork() {
        const { data } = await supabase.from("works").select("*").eq("id", id).single();
        setWork(data);
    }

    async function handleUpdate(e) {
        e.preventDefault();
        await supabase.from("works").update(work).eq("id", id);
        alert("수정 완료!");
        navigate("/admin/list");
    }

    if (!work) return <p>Loading...</p>;

    return (
        <form onSubmit={handleUpdate} style={{ maxWidth: "500px", margin: "50px auto" }}>
            <h2>작품 수정</h2>

            <input
                type="text"
                value={work.year}
                onChange={(e) => setWork({ ...work, year: e.target.value })}
            />
            <input
                type="text"
                value={work.title}
                onChange={(e) => setWork({ ...work, title: e.target.value })}
            />
            <textarea
                value={work.description}
                onChange={(e) => setWork({ ...work, description: e.target.value })}
            />
            <input
                type="text"
                value={work.image}
                onChange={(e) => setWork({ ...work, image: e.target.value })}
            />

            <button type="submit">저장</button>
        </form>
    );
}
