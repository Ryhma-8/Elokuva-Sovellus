import { useEffect, useState } from "react";
import "../css/favouriteList.css";
import { useUser } from "../context/useUser";
import { useLocation } from "react-router-dom";
import { getMovieDetails } from "../services/getMovieDetails";
import { useFavorites } from "../context/FavoritesContext";
import { Trash2 } from "lucide-react";

export default function FavouriteList() {
  const { favouriteMovies, toggleFavorite } = useFavorites();
  const [movies, setMovies] = useState([]);
  const { user } = useUser();
  const location = useLocation();

  useEffect(() => {
    const fetchFavouriteDetails = async () => {
      try {
        // haetaan tietokannasta suosikit (vain movie_id)
        const movieIds = favouriteMovies.map((fav) => fav.movie_id);
        if (!movieIds.length) return;

        const results = await Promise.all(
          movieIds.map(async (id) => {
            try {
              const data = await getMovieDetails(id);
              return {
                id: data.id,
                title: data.title,
                poster: data.poster_path,
                year: data.release_date?.split("-")[0] ?? "N/A",
                vote_average: data.vote_average,
              };
            } catch (err) {
              console.warn("Skipping failed movie fetch", id);
              return null;
            }
          })
        );

        const filtered = results.filter(Boolean);
        setMovies(filtered);
      } catch (error) {
        console.error("Error fetching movie details", error);
      }
    };
    fetchFavouriteDetails();
  }, [favouriteMovies]); // jos suosikkilistalta poistetaan tai sinne lisätään niin päivitetään lista

  const handleRemove = async (movieId) => {
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
              <button
                className="remove-fav-button"
                onClick={() => handleRemove(movie.id)}
                title="remove from favourites"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
