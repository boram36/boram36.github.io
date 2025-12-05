import { useEffect, useState } from "react";
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
		<div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxHeight: 400 }}>
			<div style={{ flex: '1', marginTop: 20 }}>
				<img
					src={images[idx]}
					onClick={() => setModal({ images, index: idx })}
					style={{ cursor: 'pointer', maxWidth: '100%' }}
				/>
			</div>
			{images.length > 1 && (
				<>

					<button
						className='btn-slide-arr next'
						style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
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

	useEffect(() => {
		(async () => {
			const { data } = await supabase
				.from("portfolio_works")
				.select("*")
				.order("year", { ascending: false });

			setItems(data || []);

			const ys = [...new Set(data.map((v) => v.year))];
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

	return (
		<div className="container">

			<div className='inner'>
				{years.map((year) => {
					const yearItems = items.filter((v) => v.year === year);
					const isYearOpen = yearItems.every(item => openIds.includes(item.id));


					return (
						<section className='sect-yearList' key={year}>
							<div className={`work-top ${isYearOpen ? "open" : "close"}`} onClick={() => toggleYear(year)} style={{ cursor: "pointer" }}>
								<h2 className='work-year'>
									{year}
								</h2>
							</div>


							{/* header */}
							<div className='work-info'>
								<div className='work-label' style={{ flex: "0 0 510px" }}>(title)</div>
								<div className='work-label' style={{ flex: 2 }}>(material)</div>
								<div className='work-label' style={{ flex: 1 }}>(size)</div>
							</div>

							{yearItems.map((it) => {
								const isOpen = openIds.includes(it.id);
								const imgs = it.images || [];

								return (
									<div className='work-list' key={it.id}>
										<div
											className='work-info work-item'
											onClick={() => toggleItem(it.id)}
										>
											<div className='work-title' style={{ flex: "0 0 510px" }}>{it.title}</div>
											<div className='work-material' style={{ flex: 2 }}>{it.material}</div>
											<div className='work-size' style={{ flex: 1 }}>{it.size}</div>
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
						onClick={() => setModal(null)}
						style={{
							position: "fixed",
							inset: 0,
							background: "rgba(255,255,255,0.95)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							zIndex: 999,
						}}
					>
						<button
							onClick={(e) => {
								e.stopPropagation();
								setModal(null);
							}}
							style={{ position: "absolute", top: 30, right: 40, fontSize: 32 }}
						>
							×
						</button>

						<button
							onClick={(e) => {
								e.stopPropagation();
								setModal((m) => ({
									...m,
									index: Math.max(0, m.index - 1),
								}));
							}}
							style={{ position: "absolute", left: 40, fontSize: 40 }}
						>
							←
						</button>

						<img
							src={modal.images[modal.index]}
							style={{ maxWidth: "60vw", maxHeight: "70vh" }}
						/>

						<button
							onClick={(e) => {
								e.stopPropagation();
								setModal((m) => ({
									...m,
									index: Math.min(m.images.length - 1, m.index + 1),
								}));
							}}
							style={{ position: "absolute", right: 40, fontSize: 40 }}
						>
							→
						</button>

						<div style={{ position: "absolute", bottom: 40 }}>
							{modal.index + 1}/{modal.images.length}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
