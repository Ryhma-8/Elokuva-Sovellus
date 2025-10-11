import React from "react";
import "../../css/HeroBlock.css";
import { Link, useLocation } from "react-router-dom";
import { addGroupMovie } from "../../services/getGroupMovies";

export default function MoviesList({ movies, groupId, handleMovieAdded}) {
  const location = useLocation();
  // Sallitaan sekä /group että /group/:groupId
  const isGroupPage = location.pathname.startsWith("/group");

const [addedMovies, setAddedMovies] = React.useState(new Set());

  const handleAddToGroup = async (movie) => {
    try {
      if (!groupId) {
        alert("No group selected");
        return;
      }
      await addGroupMovie(movie, groupId);

      setAddedMovies((prev) => new Set(prev).add(movie.id));

      handleMovieAdded();
      alert("Movie added to group!");
    } catch (err) {
      console.error("Error adding movie:", err);
      alert("Failed to add movie to group.");
    }
  };

  return (
    <div className="hero-movies-box">
      {movies?.map((movie) => {
        const isAdded = addedMovies.has(movie.id);

        return (
          <div className="hero-movie-card" key={movie.id}>
            <Link to="/movie" state={{ movieId: movie.id }}>
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="hero-movie-poster"
              />
            </Link>
            <div className="hero-movie-info">
              <Link to="/movie" state={{ movieId: movie.id }}>
                <h4 className="hero-list-title">{movie.title}</h4>
              </Link>
              <p className="hero-text">Release: {movie.release_date}</p>
              <p className="hero-text">
                Score: {Math.round(movie.vote_average * 10) / 10}
              </p>
            </div>
            {isGroupPage && (
              <button
                className={`add-button-group ${isAdded ? "added" : ""}`}
                onClick={() => handleAddToGroup(movie)}
                disabled={isAdded}
              >
                {isAdded ? "✓ ADDED" : "ADD FOR GROUP"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
