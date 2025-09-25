import axios from "axios"
import { getMovieCredits } from "../services/creditSearch";
import React from "react"
import "../css/favouriteList.css"
import { getFavourites } from "../services/getFavourites";


export default function FavouriteList() {
    const [favouriteMovies, setFavouriteMovies] = React.useState([])

    React.useEffect(() => {
        const fetchFavourites = async () => {
            try {
                const favourites = await getFavourites();
                const movieIds = favourites.map(f => f.movie_id);

                const movies = await Promise.all(movieIds.map(id => getMovieCredits(id)));
                setFavouriteMovies(movies)

            }
            catch (error) {
                console.error("Error fetching favourite movies:", error);
            }
        }
            fetchFavourites()
        }, []);

    return (
        <div className="favourite-wrapper">
            <h4>FAVOURITES</h4>
            {favouriteMovies.length === 0 ? (
                <p>No favourite movies found.</p>
            ) : (
                <ul className="favourite-list">
                    {favouriteMovies.map((movie, index) => (
                        <li className="favourite-list-item" key={index}>
                            <img className="movie-poster" src={`https://image.tmdb.org/t/p/w500${movie.poster}`} alt={`${movie.title} poster`}></img>
                            <div className="movie-info-wrapper">
                                <p className="movie-title">{movie.title}</p>
                                <p className="movie-year">  ({movie.year})</p>
                                <p className="movie-vote-average">⭐ {movie.vote_average}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
  }
