import { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import InfoMenu from "./components/InfoMenu";
import AdminMenu from "./components/AdminMenu";
import Screensaver from "./components/Screensaver";
import Home from "./pages/Home";
import InfoLayout from "./layouts/InfoLayout";
import Biography from "./components/Biography";
import Publications from "./components/Publications";
import EssaysPress from "./components/EssaysPress";
import CurrentUpcoming from "./pages/CurrentUpcoming";
import Works from "./pages/Works";
import Work from "./pages/Work";
import Projects from "./components/Project";
import Video from "./components/Video";
import Contact from "./pages/Contact";

function App() {
  const [showInfo, setShowInfo] = useState(false);
  const [screensaver, setScreensaver] = useState(false);
  const location = useLocation();
  const timerRef = useRef();

  useEffect(() => {
    window.dispatchEvent(new Event('navigation-start'));
    window.dispatchEvent(new Event('navigation-end'));
  }, [location]);

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (screensaver) setScreensaver(false);
      timerRef.current = setTimeout(() => setScreensaver(true), 6000);
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [screensaver]);

  return (
    <>
      {screensaver && <Screensaver onExit={() => setScreensaver(false)} />}
      {!screensaver && (
        <>
          <Header onInfoClick={() => setShowInfo(!showInfo)} />
          {showInfo && <InfoMenu />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/info" element={<InfoLayout />}>
              <Route path="biography" element={<Biography />} />
              <Route path="publications" element={<Publications />} />
              <Route path="essays" element={<EssaysPress />} />
              <Route path="current" element={<CurrentUpcoming />} />
            </Route>
            <Route path="/works" element={<Works />} />
            <Route path="/work/:year" element={<Work />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/video" element={<Video />} />
            <Route path="/contact" element={<Contact />} />

            {/* 관리자 대시보드 및 각 섹션 라우트 */}
            <Route path="/admin" element={<AdminMenu />} />
            <Route path="/admin/biography" element={<Biography isAdmin={true} />} />
            <Route path="/admin/publications" element={<Publications isAdmin={true} />} />
            <Route path="/admin/essays" element={<EssaysPress isAdmin={true} />} />
            <Route path="/admin/projects" element={<Projects isAdmin={true} />} />
            <Route path="/admin/video" element={<Video isAdmin={true} />} />
          </Routes>
        </>
      )}
    </>
  );
}

export default App;
