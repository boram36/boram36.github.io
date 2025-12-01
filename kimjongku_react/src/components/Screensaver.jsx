import React, { useEffect, useRef } from "react";
import "../styles/Screensaver.css";

const images = [
  "/assets/sample1.jpg",
  "/assets/sample2.jpg",
  "/assets/sample3.jpg",
  // ...이미지 경로 추가
];

export default function Screensaver({ onExit }) {
  const containerRef = useRef();
  useEffect(() => {
    let pos = containerRef.current ? containerRef.current.offsetWidth : 0;
    let idx = 0;
    const interval = setInterval(() => {
      if (containerRef.current) {
        pos -= 2;
        if (pos < -400) {
          idx = (idx + 1) % images.length;
          pos = containerRef.current.offsetWidth;
        }
        containerRef.current.style.transform = `translateX(${pos}px)`;
        containerRef.current.style.backgroundImage = `url(${images[idx]})`;
      }
    }, 16);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="screensaver-wrap" onClick={onExit}>
      <div className="screensaver-img" ref={containerRef}></div>
      <div className="screensaver-tip">마우스를 클릭하면 원래 화면으로 돌아갑니다</div>
    </div>
  );
}
