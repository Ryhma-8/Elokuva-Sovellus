import { NavLink } from "react-router-dom";
import "../css/header.css";

export default function Header() {
  return (
    <header className="site-header">
      <nav className="nav">
        <h1 className="logo">
          <NavLink to="/" className="logo-link">
            Movies.com
          </NavLink>
        </h1>
        <ul className="nav-links">
          <li>
            <NavLink to="/movies" className={({ isActive }) => (isActive ? "active" : "")}>
              Movies
            </NavLink>
          </li>
          <li>
            <NavLink to="/showtimes" className={({ isActive }) => (isActive ? "active" : "")}>
              Presenting times
            </NavLink>
          </li>
          <li>
            <NavLink to="/groups" className={({ isActive }) => (isActive ? "active" : "")}>
              Groups 
            </NavLink>
          </li>
          <li>
            <NavLink to="/movie" className={({ isActive }) => (isActive ? "active" : "")}>
              (MoviePage)
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
