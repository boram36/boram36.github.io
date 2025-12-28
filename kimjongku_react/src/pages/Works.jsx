import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/InfoLayout.css";
import "../styles/Works.css";

function ImageSlider({ images, onOpen }) {
	const [index, setIndex] = useState(0);

	if (!Array.isArray(images) || images.length === 0) return null;

	const hasMultiple = images.length > 1;

	const goPrev = (event) => {
		event.stopPropagation();
		setIndex((prev) => (prev - 1 + images.length) % images.length);
	};

	const goNext = (event) => {
		event.stopPropagation();
		setIndex((prev) => (prev + 1) % images.length);
	};

	return (
		<div className="work-image-slide" style={{ position: "relative", display: "flex", alignItems: "center", maxHeight: 400 }}>
			<div className="work-image_img" style={{ flex: 1, marginTop: 20 }}>
				<img
					src={images[index]}
					onClick={() => onOpen(images, index)}
					style={{ cursor: "pointer", maxWidth: "100%" }}
					alt="work"
				/>
			</div>
			{hasMultiple && (
				<>

					<button
						className="btn-slide-arr next"
						style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}
						onClick={goNext}
					/>
				</>
			)}
		</div>
	);
}

export default function Works() {
	const [years, setYears] = useState([]);
	const [items, setItems] = useState([]);
	const [openIds, setOpenIds] = useState([]);
	const [modal, setModal] = useState(null);
	const [scale, setScale] = useState(1);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [dragging, setDragging] = useState(false);
	const dragStart = useRef({ x: 0, y: 0 });
	const sectionRefs = useRef(new Map());
	const location = useLocation();

	const resetView = () => {
		setScale(1);
		setPosition({ x: 0, y: 0 });
		setDragging(false);
	};

	const openModal = (images, index = 0) => {
		if (!Array.isArray(images) || images.length === 0) return;
		resetView();
		setModal({ images, index });
	};

	const closeModal = () => {
		resetView();
		setModal(null);
	};

	const goPrev = (e) => {
		e?.stopPropagation();
		if (!modal) return;
		resetView();
		setModal((current) => ({
			...current,
			index: (current.index - 1 + current.images.length) % current.images.length,
		}));
	};

	const goNext = (e) => {
		e?.stopPropagation();
		if (!modal) return;
		resetView();
		setModal((current) => ({
			...current,
			index: (current.index + 1) % current.images.length,
		}));
	};

	const handleMouseDown = (e) => {
		e.stopPropagation();
		setDragging(true);
		dragStart.current = {
			x: e.clientX - position.x,
			y: e.clientY - position.y,
		};
	};

	const handleMouseMove = (e) => {
		if (!dragging) return;
		setPosition({
			x: e.clientX - dragStart.current.x,
			y: e.clientY - dragStart.current.y,
		});
	};

	const handleMouseUp = () => {
		setDragging(false);
	};

	const handleWheel = (e) => {
		e.preventDefault();
		e.stopPropagation();
		const delta = e.deltaY < 0 ? 0.2 : -0.2;
		setScale((prev) => Math.min(3, Math.max(0.5, prev + delta)));
	};

	const zoomIn = (e) => {
		e.stopPropagation();
		setScale((prev) => Math.min(3, prev + 0.2));
	};

	const zoomOut = (e) => {
		e.stopPropagation();
		setScale((prev) => Math.max(0.5, prev - 0.2));
	};

	const zoomReset = (e) => {
		e.stopPropagation();
		resetView();
	};


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
								const hasGallery = imgs.length > 0;

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

										{hasGallery && (
											<div className={`info-record-expand ${isOpen ? "open" : ""}`}>
												<div className="info-record-expand-inner">
													<div style={{ display: "flex" }}>
														<div style={{ flex: "0 0 510px" }}>
														</div>
														<div style={{ flex: 1 }}>
															<div className="info-record-image">
																<div className="work-image" style={{ marginBottom: 10 }}>
																	<ImageSlider images={imgs} onOpen={openModal} />
																</div>
															</div>
														</div>
													</div>

												</div>
											</div>
										)}
									</div>
								);
							})}
						</section>
					);
				})}

				{modal && (
					<div
						className='modal-container'
						onClick={closeModal}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseUp}
						onWheel={handleWheel}
					>
						<button
							className='btn-close-modal'
							onClick={(e) => {
								e.stopPropagation();
								closeModal();
							}}
							style={{ position: "absolute", top: 30, right: 40, fontSize: 32 }}
						></button>

						{modal.images.length > 1 && (
							<button className='btn-slide-arr prev' onClick={goPrev}></button>
						)}

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
							onMouseDown={handleMouseDown}

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
									onClick={zoomIn}
									title="확대"
								>＋</button>
								<button
									style={{ fontSize: 22, padding: '2px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
									onClick={zoomOut}
									title="축소"
								>－</button>
								<button
									style={{ fontSize: 18, padding: '2px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
									onClick={zoomReset}
									title="원본"
								> <i className="icon-reset"></i></button>
							</div>
						</div>

						{modal.images.length > 1 && (
							<button className='btn-slide-arr next' onClick={goNext}></button>
						)}

						<div className='slide-pagination'>
							{modal.index + 1}/{modal.images.length}
						</div>
					</div>
				)}
			</div>


		</div>
	);
}
