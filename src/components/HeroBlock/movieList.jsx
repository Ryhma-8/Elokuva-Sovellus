import React from "react";
import "../../css/HeroBlock.css"

export default function MoviesList({movies}) {
    return (
        <div className="movies-box">
            {movies?.map((movie) => (
                <div className="movie-card" key={movie.id}>
                    <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} className="movie-poster"/>
                    <div className="movie-info">
                        <h4>{movie.title}</h4>
                        <p>Release: {movie.release_date}</p>
                        <p>Score: {Math.round(movie.vote_average * 10) / 10}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
