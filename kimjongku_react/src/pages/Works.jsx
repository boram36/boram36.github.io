import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import '../styles/Works.css';

function Collapse({ open, children }) {
	return (
		<div
			style={{
				maxHeight: open ? 1000 : 0,
				overflow: "hidden",
				transition: "max-height 0.3s ease",
			}}
		>
			{children}
		</div>
	);
}

function ImageSlider({ images, setModal }) {
	const [idx, setIdx] = useState(0);

	return (
		<div classsName="work-image_slide" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
			<div className='work-image_img' style={{ flex: '1', marginTop: 20 }}>
				<img
					src={images[idx]}
					onClick={() => setModal({ images, index: idx })}
					style={{ cursor: 'pointer', maxWidth: '100%' }}
				/>
			</div>
			{images.length > 0 && (
				<>

					<button
						className='btn-slide-arr next'
						style={{}}
						onClick={(e) => {
							e.stopPropagation();
							setIdx((idx + 1) % images.length);
						}}
					></button>
				</>
			)}
		</div>
	);
}

export default function Works() {
	const [years, setYears] = useState([]);
	const [items, setItems] = useState([]);
	const [openIds, setOpenIds] = useState([]);
	const [openYears, setOpenYears] = useState([]);
	const [modal, setModal] = useState(null);
	const [scale, setScale] = useState(1);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [dragging, setDragging] = useState(false);
	const dragStart = useRef({ x: 0, y: 0 });
	const sectionRefs = useRef(new Map());
	const location = useLocation();


	useEffect(() => {
		(async () => {
			const { data } = await supabase
				.from("portfolio_works")
				.select("*")
				.order("year", { ascending: false })
				.order("id", { ascending: true }); // id 오름차순: 먼저 등록된 것이 위에

			setItems(data || []);

			// 년도별로 최신이 위에, 같은 년도면 id 오름차순(먼저 등록된 것 상단)
			const ys = [...new Set((data || []).map((v) => v.year))];
			setYears(ys);
		})();
	}, []);

	const toggleItem = (id) => {
		setOpenIds((prev) =>
			prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
		);
	};

	const toggleYear = (year) => {
		const ids = items.filter((v) => v.year === year).map((v) => v.id);
		const isOpen = ids.every((id) => openIds.includes(id));

		setOpenIds((prev) =>
			isOpen ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]
		);
	};

	useEffect(() => {
		const hash = location.hash ? location.hash.replace("#", "").trim() : "";
		if (!hash || !items.length) return;

		const targetYear = Number(hash) || hash;
		if (!items.some((item) => String(item.year) === String(targetYear))) {
			return;
		}

		const targetSection = sectionRefs.current.get(String(targetYear));
		if (!targetSection) return;

		window.requestAnimationFrame(() => {
			targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
		});
	}, [location.hash, items]);

	useEffect(() => {
		return () => {
			window.scrollTo({ top: 0 });
		};
	}, []);

	return (
		<div className="container works">

			<div className='inner'>
				{years.map((year) => {
					// 같은 년도 내에서 id 오름차순(먼저 등록된 것 상단)
					const yearItems = items.filter((v) => v.year === year).sort((a, b) => a.id - b.id);
					const isYearOpen = yearItems.every(item => openIds.includes(item.id));

					return (
						<section
							className='sect-yearList'
							key={year}
							id={String(year)}
							ref={(el) => {
								const map = sectionRefs.current;
								if (el) {
									map.set(String(year), el);
								} else {
									map.delete(String(year));
								}
							}}
						>
							<div className={`work-top ${isYearOpen ? "open" : "close"}`} onClick={() => toggleYear(year)} style={{ cursor: "pointer" }}>
								<h2 className='work-year'>
									{year}
								</h2>
							</div>


							{yearItems.map((it, idx) => {
								const isOpen = openIds.includes(it.id);
								const imgs = it.images || [];
								const showLabels = idx === 0;

								return (
									<div className='work-list' key={it.id}>
										<div
											className='work-info work-item'
											onClick={() => toggleItem(it.id)}
										>
											<div className='work-title' style={{ flex: "0 0 510px" }}>
												{showLabels && <p className='work-label'>(title)</p>}
												{it.title}
											</div>
											<div className='work-material' style={{ flex: 2 }}>
												{showLabels && <p className='work-label'>(material)</p>}
												{it.material}
											</div>
											<div className='work-size' style={{ flex: 1 }}>
												{showLabels && <p className='work-label'>(size)</p>}
												{it.size}
											</div>
										</div>

										<Collapse open={isOpen}>
											<div className='work-info'>
												<div style={{ flex: "0 0 510px" }}></div>
												<div style={{ flex: 2 }}>
													<div className='work-image'>
														{imgs.length > 0 && (
															<ImageSlider images={imgs} setModal={setModal} />
														)}
													</div>

												</div>
											</div>

										</Collapse>
									</div>
								);
							})}
						</section>
					);
				})}

				{modal && (
					<div
						className='modal-container'
						onClick={() => setModal(null)}
						style={{

						}}
					>
						<button
							className='btn-close-modal'
							onClick={(e) => {
								e.stopPropagation();
								setScale(1);
								setPosition({ x: 0, y: 0 });
								setModal(null);
							}}

							style={{ position: "absolute", top: 30, right: 40, fontSize: 32 }}
						></button>

						<button
							className='btn-slide-arr prev'
							onClick={(e) => {
								e.stopPropagation();
								setScale(1);
								setPosition({ x: 0, y: 0 });

								setModal((m) => ({
									...m,
									index: (m.index - 1 + m.images.length) % m.images.length,
								}));
							}}
						></button>

						<div
							style={{
								position: 'relative',
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								maxWidth: "1560px",
								maxHeight: "700px",
								overflow: "hidden",
								cursor: dragging ? "grabbing" : "grab"
							}}

						>
							<img
								src={modal.images[modal.index]}
								style={{
									transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
									transition: dragging ? "none" : "transform 0.15s ease",
									maxWidth: "1560px",
									height: "700px",
									objectFit: "contain",
									userSelect: "none",
									pointerEvents: "none"
								}}
								draggable="false"
							/>
							<div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: 8, zIndex: 2 }}>
								<button
									style={{ fontSize: 22, padding: '2px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
									onClick={e => { e.stopPropagation(); setScale(s => Math.min(3, s + 0.2)); }}
									title="확대"
								>＋</button>
								<button
									style={{ fontSize: 22, padding: '2px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
									onClick={e => { e.stopPropagation(); setScale(s => Math.max(0.5, s - 0.2)); }}
									title="축소"
								>－</button>
								<button
									style={{ fontSize: 18, padding: '2px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
									onClick={e => { e.stopPropagation(); setScale(1); setPosition({ x: 0, y: 0 }); }}
									title="원본"
								>원본</button>
							</div>
						</div>



						<button
							className='btn-slide-arr next'
							onClick={(e) => {
								e.stopPropagation();
								setScale(1);
								setPosition({ x: 0, y: 0 });

								setModal((m) => ({
									...m,
									index: (m.index + 1) % m.images.length,
								}));
							}}

						></button>

						<div className='slide-pagination'>
							{modal.index + 1}/{modal.images.length}
						</div>
					</div>
				)}
			</div>
			<div className='info-copyright'>
				<div className="inner">
					© Kim Jongku. All rights reserved.
				</div>
			</div>

		</div>
	);
}
