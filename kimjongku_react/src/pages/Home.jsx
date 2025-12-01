
import { Link } from "react-router-dom";
import "../styles/Home.css";
// import 'bootstrap/dist/css/bootstrap.min.css';

const years = Array.from({ length: 2025 - 1988 + 1 }, (_, i) => 2025 - i);

export default function Home() {
  return (
    <div className="container">
      <div className="inner">
        <ul className="year-listing list-unstyled">
          {years.map((year) => (
            <li key={year}>
              <Link to={`/work/${year}`} className="year-item">
                {year}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
