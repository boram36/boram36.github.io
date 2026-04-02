
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Header.css";

export default function Header({ onInfoClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isInfoPage = location.pathname.startsWith("/info");
  const isWorkPage = location.pathname.startsWith("/work");
  const isAdmin = location.pathname.startsWith("/admin");

  const handleInfoNavigate = () => {
    // Force a refresh signal even when already on /info/biography.
    navigate("/info/biography", {
      state: { refreshAt: Date.now() },
    });
  };

  return (
    <header className={`header${isInfoPage ? " info-active" : ""}${isWorkPage ? " work-active" : ""} ${isAdmin ? " admin-active" : ""}`}>
      <div className='inner'>
        <div className="header-content">
          <Link to="/" className="site-title">Kim Jongku</Link>
          <button className="info-button" onClick={handleInfoNavigate}>Info</button>
        </div>
      </div>
    </header>
  );
}
