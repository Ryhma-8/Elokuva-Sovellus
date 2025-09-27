import React from "react";
import "../../css/HeroBlock.css"
import { Link } from "react-router-dom";

export default function MoviesList({movies}) {
    return (
        <div className="hero-movies-box">
            {movies?.map((movie) => (
                <div className="hero-movie-card" key={movie.id}>
                    <Link to="/movie" state={{movieId: movie.id}}>
                    <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} className="hero-movie-poster"/>
                    </Link>
                    <div className="hero-movie-info">
                        <Link to="/movie" state={{ movieId: movie.id }}>
                            <h4 className="hero-list-title">{movie.title}</h4>
                        </Link>
                        <p className="hero-text">Release: {movie.release_date}</p>
                        <p  className="hero-text">Score: {Math.round(movie.vote_average * 10) / 10}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
