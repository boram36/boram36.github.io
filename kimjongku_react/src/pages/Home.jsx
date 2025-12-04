
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
// import 'bootstrap/dist/css/bootstrap.min.css';

const years = Array.from({ length: 2025 - 1988 + 1 }, (_, i) => 2025 - i);

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="inner">
        <ul className="year-listing list-unstyled">
          {years.map((year) => (
            <li key={year}>
              <button
                className="year-item"
                onClick={() => navigate(`/works#${year}`)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {year}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
