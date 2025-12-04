import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Works() {
	const [years, setYears] = useState([]);
	const [items, setItems] = useState([]);
	const [openIds, setOpenIds] = useState([]);
	const [sliderIndex, setSliderIndex] = useState({});
	const [modal, setModal] = useState(null); // { images: string[], index: number }
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const location = useLocation();

	// 부드러운 슬라이드다운을 위한 콜랩스 컴포넌트
	const Collapse = ({ open, children }) => {
		const [height, setHeight] = useState(0);
		const [render, setRender] = useState(open);
		const contentRef = useRef(null);

		useEffect(() => {
			if (open) setRender(true);
			const el = contentRef.current;
			if (!el) return;
			const target = open ? el.scrollHeight : 0;
			requestAnimationFrame(() => setHeight(target));
			if (!open) {
				const timeout = setTimeout(() => setRender(false), 240);
				return () => clearTimeout(timeout);
			}
		}, [open]);

		return (
			<div className={`collapse ${open ? 'open' : 'closed'}`}>
				<div ref={contentRef}>
					{render ? children : null}
				</div>
			</div>
		);
	};

	useEffect(() => {
		const loadYears = async () => {
			setLoading(true);
			setError(null);
			console.log('[Works] Fetching all works…');
			const { data, error } = await supabase
				.from("portfolio_works")
				.select("id, year, title, material, size, images")
				.order("year", { ascending: false })
				.order("id", { ascending: true });
			console.log('[Works] Result:', data, 'error:', error);
			if (error) {
				setError(error.message);
				setLoading(false);
				return;
			}
			const uniqueYears = Array.from(new Set((data || []).map((d) => d.year)));
			console.log('[Works] Unique years:', uniqueYears);
			setYears(uniqueYears);
			setItems(data || []);
			setLoading(false);
		};
		loadYears();
	}, []);

	// 해시로 진입 시 해당 연도 섹션으로 스크롤
	useEffect(() => {
		if (!years.length) return;
		const hash = location.hash.replace('#', '');
		if (hash) {
			const el = document.getElementById(`year-${hash}`);
			if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [years, location.hash]);

	if (loading) return <div style={{ padding: "2rem" }}>Loading…</div>;
	if (error) return (
		<div style={{ padding: "2rem" }}>
			<div style={{ color: 'red', fontWeight: 600 }}>Error: {error}</div>
			<div style={{ marginTop: 8, color: '#666' }}>
				권한 또는 정책 문제일 수 있습니다. Supabase RLS에서 `portfolio_works`의 `SELECT`가 `anon`에게 허용되어 있는지 확인하세요.
			</div>
		</div>
	);

	return (
		<div className="container">
			<div className="inner">
				{years.map((y) => (
					<section key={y} id={`year-${y}`} className="year-section">
						{items.filter(it => it.year === y).map((it) => {
							const isOpen = openIds.includes(it.id);
							const imgs = Array.isArray(it.images) ? it.images : [];
							const idx = sliderIndex[it.id] ?? 0;
							const canPrev = imgs.length > 1 && idx > 0;
							const canNext = imgs.length > 1 && idx < imgs.length - 1;
							return (
								<div key={it.id} className="work-item">
									<button
										onClick={() => setOpenIds((prev) => (isOpen ? prev.filter((id) => id !== it.id) : [...prev, it.id]))}
										className="work-button"
										
									>
										<div className="work-top">
											<span className="work-year">{y}</span>
											<span className={`work-toggle ${isOpen ? 'open' : 'closed'}`}>
												<i className="toggle-btn"></i>
											</span>
										</div>
										
										<div className="work-info">
											<div className="title">
												<p className="work-label">(title)</p>
												<p className="work-title">{it.title}</p>
											</div>
											<div className="material">
												<p className="work-label">(material)</p>
												<p className="work-material">{it.material}</p>
											</div>
											<div className="size">
												<p className="work-label">(size)</p>
												<p className="work-size">{it.size}</p>
											</div>
										</div>
										
									</button>

									
									<Collapse open={isOpen}>
										<div className="work-image">
											{imgs.length === 0 && (
												<div></div>
											)}
											{imgs.length > 0 && (
												<div className="carousel-container">
													{imgs.length > 1 && (
														<button
															className="carousel-next"
															aria-label="next"
															disabled={!canNext}
															onClick={() => setSliderIndex((s) => ({ ...s, [it.id]: Math.min(imgs.length - 1, idx + 1) }))}
														>
															›
														</button>
													)}
													<div className="carousel-viewport">
														<div className="carousel-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
															{imgs.map((src, i) => (
																<img
																	key={src}
																	src={src}
																	alt={`${it.title} ${i + 1}`}
																	className="carousel-slide"
																	onClick={() => setModal({ images: imgs, index: i })}
																/>
															))}
														</div>
													</div>
													{imgs.length > 1 && (
														<div className="carousel-thumbs">
															{imgs.map((src, i) => (
																<img
																	key={src}
																	src={src}
																	alt={`${it.title} ${i + 1}`}
																	className={`carousel-thumb ${i === idx ? 'active' : ''}`}
																	onClick={() => setSliderIndex((s) => ({ ...s, [it.id]: i }))}
																/>
															))}
														</div>
													)}
												</div>
											)}
										</div>
									</Collapse>
								</div>
							);
						})}
					</section>
				))}

				{modal && (
					<div className="modal-overlay" onClick={() => setModal(null)}>
						<div className="modal-content" onClick={(e) => e.stopPropagation()}>
							<button
								className="modal-close"
								aria-label="close"
								onClick={() => setModal(null)}
							>
								×
							</button>
							<div className="modal-viewport">
								<div className="modal-track" style={{ transform: `translateX(-${(modal.index || 0) * 100}%)` }}>
									{(modal.images || []).map((src, i) => (
										<img key={src} src={src} alt={`zoom ${i + 1}`} className="modal-slide" />
									))}
								</div>
							</div>
							{(modal.images || []).length > 1 && (
								<>
									<button
										className={`modal-prev ${(modal.index || 0) === 0 ? 'disabled' : ''}`}
										aria-label="prev"
										onClick={() => setModal((m) => ({ ...m, index: Math.max(0, (m.index || 0) - 1) }))}
									>
										←
									</button>
									<button
										className="modal-next"
										aria-label="next"
										onClick={() => setModal((m) => ({ ...m, index: Math.min((m.images || []).length - 1, (m.index || 0) + 1) }))}
									>
										→
									</button>
								</>
							)}
							<div className="modal-counter">
								{(modal.index || 0) + 1}/{(modal.images || []).length || 1}
							</div>
						</div>
					</div>
				)}
				{years.length === 0 && (
					<div style={{ marginTop: 12, color: '#888' }}>
						연도 데이터가 없습니다. 테이블에 행이 존재하는지, 정책이 허용되는지 확인하세요.
					</div>
				)}
			</div>
		</div>
	);
}
