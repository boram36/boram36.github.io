
import { Link } from "react-router-dom";
import "../styles/InfoMenu.css";

const links = [
  { title: "Biography", path: "/info/biography" },
  { title: "Publications", path: "/info/publications" },
  { title: "Essays / Press", path: "/info/essays" },
  { title: "Current / Upcoming", path: "/info/current" },
];

export default function InfoMenu() {
  return (
    <div className="info-menu">
      {links.map((item, index) => (
        <Link key={index} to={item.path} className="info-link">
          {item.title}
        </Link>
      ))}
    </div>
  );
}
