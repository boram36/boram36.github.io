import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function AdminList() {
    const [works, setWorks] = useState([]);

    useEffect(() => {
        fetchWorks();
    }, []);

    const fetchWorks = async () => {
        const { data, error } = await supabase
            .from("works")
            .select("id, year, title, category, image");

        if (error) {
            console.error("데이터 불러오기 오류:", error);
        } else {
            setWorks(data);
            console.log("불러온 데이터:", data);
        }
    };

    return (
        <div className="admin-list">
            <h2>Admin 작품 목록</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>연도</th>
                        <th>제목</th>
                        <th>카테고리</th>
                        <th>이미지</th>
                    </tr>
                </thead>
                <tbody>
                    {works.length === 0 ? (
                        <tr>
                            <td colSpan="5">데이터가 없습니다.</td>
                        </tr>
                    ) : (
                        works.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.year}</td>
                                <td>{item.title}</td>
                                <td>{item.category}</td>
                                <td>
                                    {item.image ? (
                                        <img src={item.image} width="80" />
                                    ) : (
                                        "이미지 없음"
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default AdminList;
