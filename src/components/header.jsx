import { Link, NavLink} from "react-router-dom";
import "../css/header.css";
import {logOut} from "../services/logOut";
import { useUser } from "../context/useUser";


export default function Header() {
  const { user, setUser} = useUser();


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
          {user?.username ?(
            <>
          <li>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
              {user.username}'s Profile
            </NavLink>
          </li>
          <Link className="logout-link" onClick={() => logOut (setUser)}>Log out</Link>
          </>
          ):(
          <li>
            <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
              Sign in
            </NavLink>
          </li>
          <li>
            <Link className="logout-link" onClick={logOut}>
              Log out
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
