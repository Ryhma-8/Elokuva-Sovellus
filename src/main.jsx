import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./css/index.css";
import LandingPage from "./screens/landingPage.jsx";
import ShowtimesPage from "./screens/ShowtimesPage.jsx";
import MoviesPage from "./screens/MoviesPage.jsx";
import MoviePage from "./screens/moviePage.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/showtimes" element={<ShowtimesPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movie" element={<MoviePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
