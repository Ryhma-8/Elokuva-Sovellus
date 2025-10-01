import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserProvider from "./context/UserProvider.jsx";
import LandingPage from "./screens/landingPage.jsx";
import ShowtimesPage from "./screens/ShowtimesPage.jsx";
import MoviesPage from "./screens/MoviesPage.jsx";
import MoviePage from "./screens/moviePage.jsx";
import ProfilePage from "./screens/profilePage.jsx";
import Authentication, {AuthenticationMode} from "./screens/Authentication.jsx";
import GroupsPage from "./screens/GroupsPage.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/showtimes" element={<ShowtimesPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movie" element={<MoviePage />} />
        <Route path="/profile" element={<ProfilePage/>} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/login" element={<Authentication authenticationMode={AuthenticationMode.SignIn}/>} />
        <Route path="/register" element={<Authentication authenticationMode={AuthenticationMode.SignUp}/>} />
      </Routes>
    </BrowserRouter>
    </UserProvider>
  </StrictMode>
);