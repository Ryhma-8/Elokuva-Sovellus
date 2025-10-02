import '../css/footer.css'
import { Link, NavLink } from "react-router-dom";
import { useUser } from '../context/useUser';
import movbee from "../assets/movbee.png";
import { logOut } from '../services/logOut';
import { useRef } from 'react';

export default function Footer() {
    const { user, setUser } = useUser();
    return (
        <footer className='site-footer'>
                    <nav className="nav">
        <h1 className="logo">
          <NavLink to="/" className="logo-link">
          <img src={movbee} className="header-image" alt="MovBee" />
            MovBee
          </NavLink>
        </h1>
        <ul className="nav-links">
        <li>
            <NavLink to="/group" className={({ isActive }) => (isActive ? "active" : "")}>
              Group
            </NavLink>
          </li>
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
          {user?.username ? (
            <>
              <li>
                <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
                  {user.username}'s Profile
                </NavLink>
              </li>
              <li>
                <Link className="logout-link" onClick={() => logOut(setUser)}>
                  Log out
                </Link>
              </li>
            </>
          ) : (
            <li>
              <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                Sign in
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
            <div className='footer-text-wrapper'>
                <p>Group 8</p>
                <p>© 2025 OAMK. All rights reserved.</p>
            </div>
        </footer>
    )
}
