import { Link } from "react-router-dom";
import "../styles/AdminMenu.css";

export default function AdminMenu() {
  return (

    <div className='container'>
      <div className='inner'>
        <div className="admin-menu">
          <h3>관리자 메뉴</h3>
          <ul>
            <li><Link to="/admin/biography">Biography</Link></li>
            <li><Link to="/admin/publications">Publications</Link></li>
            <li><Link to="/admin/essays">Essays &amp; Press</Link></li>
            <li><Link to="/admin/projects">Project</Link></li>
            <li><Link to="/admin/video">Video</Link></li>
            <li>
              <Link to="/admin/works">Works</Link>
              <Link to="/admin/works/list">리스트</Link>

            </li>
          </ul>
        </div>
      </div>
    </div>

  );
}
