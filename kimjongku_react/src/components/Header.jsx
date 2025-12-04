
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Header.css";

export default function Header({ onInfoClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isInfoPage = location.pathname.startsWith("/info");
  const isWorkPage = location.pathname.startsWith("/work");
  return (
    <header className={`header${isInfoPage ? " info-active" : ""}${isWorkPage ? " work-active" : ""}`}>
      <div className='inner'>
        <div className="header-content">
          <Link to="/" className="site-title">Kim Jongku</Link>
          <button className="info-button" onClick={() => navigate('/info/biography')}>Info</button>
        </div>
      </div>
    </header>
  );
}
