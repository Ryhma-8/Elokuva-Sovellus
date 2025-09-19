import React, { useEffect, useState } from "react";
import "../../css/movieBlock.css";
import { getMovieCredits } from "../../services/creditSearch";

const MovieBlock = ({ movieId }) => {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    if (movieId) {
      getMovieCredits(movieId)
        .then((data) => setMovie(data))
        .catch((err) => console.error(err));
    }
  }, [movieId]);

  if (!movie) return null;

  return (
    <div className="movie-background">
      <div className="movie-header">
        <h2 className="movie-name">{movie.title}</h2>
        <div className="movie-year-lenght">
        <p className="movie-year">{movie.year}</p>
        <p className="movie-lenght">{movie.runtime} min</p>
        </div>
      </div>

      <div className="movie-images">
    <img className="movie-poster"
        src={`https://image.tmdb.org/t/p/w500${movie.poster}`} alt={`${movie.title} poster`}/>
    <img className="movie-backdrop"
        src={`https://image.tmdb.org/t/p/w780${movie.backdrop}`} alt={`${movie.title} backdrop`}/>
    </div>

      <div className="movie-footer">
        <p className="movie-category">
          Category: {movie.genres.join(", ")}
        </p>
        <p className="movie-director">
          Director: {movie.directors.map((d) => d.name).join(", ")}
        </p>
        <p className="movie-writer">
          Writer: {movie.writers.map((w) => w.name).join(", ")}
        </p>
        <p className="movie-actor">
          Actors: {movie.actors.map((a) => a.name).join(", ")}
        </p>
        <p className="movie-description">Description: {movie.overview}</p>
      </div>
    </div>
  );
};

export default MovieBlock;
