
import { NavLink } from "react-router-dom";
import "../styles/InfoSidebar.css";

const menuItems = [
  { title: "Biography", path: "/info/biography" },
  { title: "Publications", path: "/info/publications" },
  { title: "Essays / Press", path: "/info/essays" },
  { title: "Current / Upcoming", path: "/info/current" },
];

export default function InfoSidebar() {
  return (
    <nav className="info-sidebar">
      {menuItems.map((item, idx) => (
        <NavLink 
          key={idx} 
          to={item.path} 
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}
