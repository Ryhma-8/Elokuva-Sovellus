import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/recommendations.css";

export default function Recommendations({ movieId }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!movieId) return;

    const fetchRecommendations = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/recommendations?language=en-US&page=1`,{
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`
        }
      });
        const data = await res.json();
        const recommendedAmount = data.results?.slice(0, 4) || [];
        setRecommendations(recommendedAmount);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };

    fetchRecommendations();
  }, [movieId]);

  if (!recommendations.length) return null;

  return (
    <div className="recommendations-wrapper">
      <h3>Recommendations</h3>
      <div className="recommendations-grid">
        {recommendations.map((movie) => (
          <Link
            key={movie.id}
            to={`/movie`}
            state={{ movieId: movie.id }}
            className="recommendation-item"
            onClick={() => window.scrollTo(0, 0)}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="recommendation-poster"
            />
            <p className="recommendation-title">{movie.title}</p>
            <p className="recommended-movie-year">({movie.release_date.split("-")[0]})</p>
            <p className="recommended-movie-review">⭐ {movie.vote_average.toFixed(1)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
