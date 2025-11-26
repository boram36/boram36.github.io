import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { years as defaultYears } from "../data/years";
import "./YearList.css";

export default function YearList() {
    const [years, setYears] = useState(defaultYears);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchYears() {
            try {
                const { data, error } = await supabase
                    .from("works")
                    .select("year")
                    .order("year", { ascending: false });

                if (error) throw error;

                // DB에서 가져온 연도 추출
                const dbYears = data.map(work => work.year);

                // 기본 연도 목록과 DB 연도 합치기 및 중복 제거
                const allYears = [...new Set([...dbYears, ...defaultYears])];

                // 내림차순 정렬
                allYears.sort((a, b) => b - a);

                setYears(allYears);
            } catch (error) {
                console.error("연도 데이터 로딩 실패:", error);
                // 에러 시 기본 연도 목록 사용
                setYears(defaultYears);
            } finally {
                setLoading(false);
            }
        }

        fetchYears();
    }, []);

    if (loading) {
        return <div className="years-container"></div>;
    }

    return (
        <div className="years-container">
            {years.map((year) => (
                <Link key={year} to={`/work/${year}`} className="year-item">
                    {year}
                </Link>
            ))}
        </div>
    );
}
