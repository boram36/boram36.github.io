import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className="header-wrap">
            <div className="header-left">
                <Link to="/">Christopher Wool</Link>
            </div>
            <div className="header-right">
                <Link to="/info">Info</Link>
            </div>
        </header>
    );
}
