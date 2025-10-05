import { useEffect, useState } from "react";
import "../css/favouriteList.css";
import { useUser } from "../context/useUser";
import { useLocation } from "react-router-dom";
import { getMovieDetails } from "../services/getMovieDetails";
import { useFavorites } from "../context/FavoritesContext";
import { getFavourites } from "../services/getFavourites"; 
import { Trash2 } from "lucide-react";

export default function FavouriteList({ userId }) {
  const { favouriteMovies, toggleFavorite } = useFavorites(); // private
  const { user } = useUser(); 
  const location = useLocation();

  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        let favs;

        if (userId) {
          // PUBLIC MODE
          favs = await getFavourites({ userId });
        } else {
          // PRIVATE MODE
          favs = favouriteMovies;
        }

        if (!favs || favs.length === 0) {
          setMovies([]);
          return;
        }

        const results = await Promise.all(
          favs.map(async (fav) => {
            try {
              const data = await getMovieDetails(fav.movie_id || fav.id);
              return {
                id: data.id,
                title: data.title,
                poster: data.poster_path,
                year: data.release_date?.split("-")[0] ?? "N/A",
                vote_average: data.vote_average,
              };
            } catch (err) {
              console.warn("Skipping failed movie fetch", fav.movie_id || fav.id);
              return null;
            }
          })
        );

        setMovies(results.filter(Boolean));
      } catch (error) {
        console.error("Error fetching favourites", error);
      }
    };

    fetchFavourites();
  }, [userId, favouriteMovies]);

  const handleRemove = async (movieId) => {
    if (userId) return; // ei voi poistaa public-näkymässä
    toggleFavorite({ id: movieId });
    setMovies((prev) => prev.filter((m) => m.id !== movieId));
  };

  const isProfilePage = location.pathname === "/profile";

  return (
    <div className="favourite-wrapper">
      <h4>FAVOURITES</h4>

      {isProfilePage && (
        <button
          className="copy-link-button"
          onClick={() => {
            const link = `${window.location.origin}/favorites/${user?.id}`;
            navigator.clipboard
              .writeText(link)
              .then(() => console.log("Copied:", link))
              .catch((err) => console.error(err));
          }}
        >
          Copy link
        </button>
      )}

      {movies.length === 0 ? (
        <p>No favourite movies found.</p>
      ) : (
        <ul className="favourite-list">
          {movies.map((movie) => (
            <li className="favourite-list-item" key={movie.id}>
              <img
                className="movie-poster"
                src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                alt={`${movie.title} poster`}
              />
              <div className="movie-info-wrapper">
                <p className="movie-title">{movie.title}</p>
                <p className="movie-year">({movie.year})</p>
                <p className="movie-vote-average">
                  ⭐ {movie.vote_average.toFixed(1)}
                </p>
              </div>
              {!userId && (
                <button
                  className="remove-fav-button"
                  onClick={() => handleRemove(movie.id)}
                  title="remove from favourites"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
