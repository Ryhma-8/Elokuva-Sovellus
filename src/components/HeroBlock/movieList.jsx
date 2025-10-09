import React from "react";
import "../../css/HeroBlock.css"
import { Link, useLocation } from "react-router-dom";
import { addGroupMovie } from "../../services/getGroupMovies";



export default function MoviesList({movies, groupId}) {

    const location = useLocation();
    const isGroupPage = location.pathname === "/group";

  const handleAddToGroup = async (movie) => {
    try {
      if (!groupId) {
        alert("No group selected");
        return;
      }

      await addGroupMovie(movie, groupId);
      alert("Movie added to group!");
    } catch (err) {
      console.error("Error adding movie:", err);
      alert("Failed to add movie to group.");
    }
  };

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
                    {isGroupPage && (<button className="add-button-group" onClick={()=> handleAddToGroup (movie)}>ADD FOR GROUP</button>)}
                </div> 
            ))}
        </div>
    )
}
