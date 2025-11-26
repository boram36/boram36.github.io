import { useState, useEffect } from "react";
import useIdleTimer from "./hooks/useIdleTimer";
import Screensaver from "./components/Screensaver";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import YearPage from "./pages/YearPage";
import AdminUpload from "./pages/AdminUpload";

function App() {
  const isIdle = useIdleTimer(6000);
  const [showScreensaver, setShowScreensaver] = useState(false);

  useEffect(() => {
    if (isIdle) setShowScreensaver(true);
  }, [isIdle]);

  const exitScreensaver = () => setShowScreensaver(false);

  return (
    <>
      {showScreensaver && <Screensaver onExit={exitScreensaver} />}

      {!showScreensaver && (
        <>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work/:year" element={<YearPage />} />
            <Route path="/admin" element={<AdminUpload />} />
          </Routes>
        </>
      )}
    </>
  );
}

export default App;
