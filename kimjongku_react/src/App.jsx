import { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import InfoMenu from "./components/InfoMenu";
import AdminMenu from "./components/AdminMenu";
import Screensaver from "./components/Screensaver";
import Home from "./pages/Home";
import InfoLayout from "./layouts/InfoLayout";
import BiographyPage from "./pages/Biography";
import EssaysPressPage from "./pages/EssayPress";
import PublicationsPage from "./pages/Publications";
import PublicArtPage from "./pages/PublicArt";
import Works from "./pages/Works";
import Work from "./pages/Work";
import Projects from "./components/Project";
import VideoPage from "./pages/Video";
import AdminWorks from "./components/AdminWorks";
import AdminWorksList from "./components/AdminWorksList";
import AdminLogin from "./components/AdminLogin";
import AdminWorksEdit from "./components/AdminWorksEdit";
import AdminMainBackground from "./components/AdminMainBackground";
import AdminBiography from "./components/AdminBiography";
import AdminBiographyList from "./components/AdminBiographyList";
import AdminBiographyEdit from "./components/AdminBiographyEdit";
import AdminPublications from "./components/AdminPublications";
import AdminPublicationsList from "./components/AdminPublicationsList";
import AdminPublicationsEdit from "./components/AdminPublicationsEdit";
import AdminPublicArt from "./components/AdminPublicArt";
import AdminPublicArtList from "./components/AdminPublicArtList";
import AdminPublicArtEdit from "./components/AdminPublicArtEdit";
import AdminVideo from "./components/AdminVideo";
import AdminVideoList from "./components/AdminVideoList";
import AdminVideoEdit from "./components/AdminVideoEdit";
import AdminEssaysPress from "./components/AdminEssaysPress";
import AdminEssaysPressList from "./components/AdminEssaysPressList";
import AdminEssaysPressEdit from "./components/AdminEssaysPressEdit";
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
  const navigate = useNavigate();
  const timerRef = useRef();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) {
      setScreensaver(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);



      timerRef.current = setTimeout(() => {
        setScreensaver(true);
      }, 100000); // ✅ 6초
    };

    // 최초 진입 시 타이머 시작
    resetTimer();

    const events = [
      "touchstart",
      "click",
    ];

    events.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAdmin, screensaver, location.pathname]);


  return (
    <>
      {!isAdmin && screensaver && <Screensaver onExit={() => setScreensaver(false)} />}
      {!screensaver && (
        <>
          <Header onInfoClick={() => setShowInfo(!showInfo)} />
          {showInfo && !isAdmin && <InfoMenu />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/info" element={<InfoLayout />}>
              <Route path="biography" element={<BiographyPage />} />
              <Route path="essays" element={<EssaysPressPage />} />
              <Route path="publications" element={<PublicationsPage />} />
              <Route path="public-art" element={<PublicArtPage />} />
              <Route path="video" element={<VideoPage />} />
            </Route>
            <Route path="/works" element={<Works />} />
            <Route path="/work/:year" element={<Work />} />
            <Route path="/video" element={<VideoPage />} />
            <Route path="/admin" element={<AdminMenu />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/biography" element={<AdminBiography />} />
            <Route path="/admin/biography/list" element={<AdminBiographyList />} />
            <Route path="/admin/biography/edit/:id" element={<AdminBiographyEdit />} />
            <Route path="/admin/publications" element={<AdminPublications />} />
            <Route path="/admin/publications/list" element={<AdminPublicationsList />} />
            <Route path="/admin/publications/edit/:id" element={<AdminPublicationsEdit />} />
            <Route path="/admin/public-art" element={<AdminPublicArt />} />
            <Route path="/admin/public-art/list" element={<AdminPublicArtList />} />
            <Route path="/admin/public-art/edit/:id" element={<AdminPublicArtEdit />} />
            <Route path="/admin/video" element={<AdminVideo />} />
            <Route path="/admin/video/list" element={<AdminVideoList />} />
            <Route path="/admin/video/edit/:id" element={<AdminVideoEdit />} />
            <Route path="/admin/essays" element={<AdminEssaysPress />} />
            <Route path="/admin/essays/list" element={<AdminEssaysPressList />} />
            <Route path="/admin/essays/edit/:id" element={<AdminEssaysPressEdit />} />
            <Route path="/admin/projects" element={<Projects isAdmin={true} />} />
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
