import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Works() {
	const [years, setYears] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadYears = async () => {
			setLoading(true);
			setError(null);
			const { data, error } = await supabase
				.from("portfolio_works")
				.select("year")
				.order("year", { ascending: false });
			if (error) {
				setError(error.message);
				setLoading(false);
				return;
			}
			const uniqueYears = Array.from(new Set((data || []).map((d) => d.year)));
			setYears(uniqueYears);
			setLoading(false);
		};
		loadYears();
	}, []);

	if (loading) return <div style={{ padding: "2rem" }}>Loading…</div>;
	if (error) return <div style={{ padding: "2rem" }}>Error: {error}</div>;

	return (
		<div style={{ padding: "2rem" }}>
			<h2>Works</h2>
			<p>연도별 작품 목록을 선택하세요.</p>
			<ul style={{ listStyle: "none", padding: 0 }}>
				{years.map((y) => (
					<li key={y} style={{ margin: "0.5rem 0" }}>
						<Link to={`/work/${y}`}>{y}</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
