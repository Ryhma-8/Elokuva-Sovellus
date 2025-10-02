import { getMovieCredits } from "../services/creditSearch";
import { useEffect, useState } from "react"
import "../css/favouriteList.css"
import { getFavourites } from "../services/getFavourites";
import { useUser } from "../context/useUser";
import { useLocation } from "react-router-dom";


export default function FavouriteList({userId, groupId}) {
    const [favouriteMovies, setFavouriteMovies] = useState([]);
    const { user } = useUser();

    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                const favourites = await getFavourites({
                groupId,...(userId ?{ userId} : {})
            });

    const movieIds = favourites.map(f => f.movie_id);

    const safeCredits = async (id) => {
        try {
            return await getMovieCredits(id)
        } catch (err) {
            return null;
        }
    }; 

    const movies = (await Promise.all(movieIds.map(safeCredits))).filter(Boolean);
    setFavouriteMovies(movies)
}
            catch (error) {
    console.error("Error fetching favourite movies:", error);
}
        }
fetchFavourites()
        }, [userId, groupId, user]);

        const isProfilePage = location.pathname === "/profile"; 

return (
    <div className="favourite-wrapper">
        <h4>FAVOURITES</h4>
        {isProfilePage && (
        <button
            className="copy-link-button"
            onClick={() => {
                const link = `${window.location.origin}/favorites/${user?.id}`;
                navigator.clipboard.writeText(link)
                    .then(() => console.log("Copied:", link))
                    .catch(err => console.error(err));
            }}
        >
            Copy link
        </button>
        )}
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