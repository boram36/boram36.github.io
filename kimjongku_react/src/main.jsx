import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import './styles/nprogress-custom.css';
import { useEffect } from 'react';

function NProgressHandler() {
  useEffect(() => {
    // 느리게 보이도록 설정 (trickleSpeed: ms, minimum: 시작값)
    NProgress.configure({ trickleSpeed: 500, minimum: 0.1, speed: 800 });
    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();
    window.addEventListener('navigation-start', handleStart);
    window.addEventListener('navigation-end', handleStop);
    return () => {
      window.removeEventListener('navigation-start', handleStart);
      window.removeEventListener('navigation-end', handleStop);
    };
  }, []);
  return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <NProgressHandler />
      <App />
    </BrowserRouter>
  </StrictMode>
);
