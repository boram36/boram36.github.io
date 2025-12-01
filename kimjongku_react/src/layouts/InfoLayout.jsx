

import { Outlet } from "react-router-dom";
import InfoSidebar from "../components/InfoSidebar";
import "../styles/InfoLayout.css";

export default function InfoLayout() {
  return (
    <div className="container">
      <div className='inner'>
        <div className="info-layout">
          <div className="info-l">
            <InfoSidebar />
          </div>
          <div className="info-r">
            <div className="info-content">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
