import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Screensaver({ onExit }) {
    const [images, setImages] = useState([]);

    useEffect(() => {
        fetchImages();
    }, []);

    async function fetchImages() {
        const { data, error } = await supabase
            .from("works")
            .select("image")
            .not("image", "is", null); // 이미지 있는 것만

        if (!error && data) {
            const list = data.map((item) => item.image).filter(Boolean);
            setImages(list);
        }
    }

    // 아무 데나 클릭 / 움직이면 종료
    const handleExit = () => {
        onExit && onExit();
    };

    if (images.length === 0) return null;

    // 무한 롤링을 위해 한 번 더 붙여서 2배 길이로 만듦
    const sliderImages = [...images, ...images];

    return (
        <div className="screensaver" onClick={handleExit}>
            <div className="screensaver-inner">
                <div className="screensaver-track">
                    {sliderImages.map((src, idx) => (
                        <div className="screensaver-item" key={`${src}-${idx}`}>
                            <img src={src} alt={`work-${idx}`} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="screensaver-hint">click to exit</div>
        </div>
    );
}
