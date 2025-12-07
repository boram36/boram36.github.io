import { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import InfoMenu from "./components/InfoMenu";
import AdminMenu from "./components/AdminMenu";
import Screensaver from "./components/Screensaver";
import Home from "./pages/Home";
import InfoLayout from "./layouts/InfoLayout";
import BiographyPage from "./pages/Biography";
import Publications from "./components/Publications";
import EssaysPress from "./components/EssaysPress";
import CurrentUpcoming from "./pages/CurrentUpcoming";
import Works from "./pages/Works";
import Work from "./pages/Work";
import Projects from "./components/Project";
import Video from "./components/Video";
import Contact from "./pages/Contact";
import AdminWorks from "./components/AdminWorks";
import AdminWorksList from "./components/AdminWorksList";
import AdminLogin from "./components/AdminLogin";
import AdminWorksEdit from "./components/AdminWorksEdit";
import AdminMainBackground from "./components/AdminMainBackground";
import AdminBiography from "./components/AdminBiography";
import AdminBiographyList from "./components/AdminBiographyList";
import AdminBiographyEdit from "./components/AdminBiographyEdit";
import { useParams } from "react-router-dom";
// AdminWorksEdit 라우트용 래퍼 컴포넌트
function AdminWorksEditWrapper() {
  const { id } = useParams();
  return <AdminWorksEdit id={id} />;
}

function App() {
  const [showInfo, setShowInfo] = useState(false);
  const [screensaver, setScreensaver] = useState(false);
  const location = useLocation();
  const timerRef = useRef();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    window.dispatchEvent(new Event('navigation-start'));
    window.dispatchEvent(new Event('navigation-end'));
  }, [location]);

  useEffect(() => {
    // Screensaver 일시 비활성화를 위해 타이머 설정을 주석 처리
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (screensaver) setScreensaver(false);
      // timerRef.current = setTimeout(() => setScreensaver(true), 6000);
    };
    if (isAdmin) {
      // 관리자 페이지에서는 스크린세이버 비활성화
      if (screensaver) setScreensaver(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return; // 이벤트 리스너 등록 안 함
    }
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [screensaver, isAdmin]);

  return (
    <>
      {/* 스크린세이버 표시 주석 처리 */}
      {/* {!isAdmin && screensaver && <Screensaver onExit={() => setScreensaver(false)} />} */}
      {true && (
        <>
          <Header onInfoClick={() => setShowInfo(!showInfo)} />
          {showInfo && !isAdmin && <InfoMenu />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/info" element={<InfoLayout />}>
              <Route path="biography" element={<BiographyPage />} />
              <Route path="publications" element={<Publications />} />
              <Route path="essays" element={<EssaysPress />} />
              <Route path="current" element={<CurrentUpcoming />} />
            </Route>
            <Route path="/works" element={<Works />} />
            <Route path="/work/:year" element={<Work />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/video" element={<Video />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminMenu />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/biography" element={<AdminBiography />} />
            <Route path="/admin/biography/list" element={<AdminBiographyList />} />
            <Route path="/admin/biography/edit/:id" element={<AdminBiographyEdit />} />
            <Route path="/admin/publications" element={<Publications isAdmin={true} />} />
            <Route path="/admin/essays" element={<EssaysPress isAdmin={true} />} />
            <Route path="/admin/projects" element={<Projects isAdmin={true} />} />
            <Route path="/admin/video" element={<Video isAdmin={true} />} />
            <Route path="/admin/works" element={<AdminWorks />} />
            <Route path="/admin/works/list" element={<AdminWorksList />} />
            <Route path="/admin/works/edit/:id" element={<AdminWorksEditWrapper />} />
            <Route path="/admin/main-bg" element={<AdminMainBackground />} />

          </Routes>
        </>
      )}
    </>
  );
}

export default App;
