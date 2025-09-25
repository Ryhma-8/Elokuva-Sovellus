import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const getMovieCredits = async (movieId) => {
  try {
    const headers = {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    };

    const [detailsRes, creditsRes, imagesRes] = await Promise.all([
      axios.get(`${BASE_URL}/movie/${movieId}`, { headers }),
      axios.get(`${BASE_URL}/movie/${movieId}/credits`, { headers }),
    ]);

    const details = detailsRes.data;
    const credits = creditsRes.data;

    const directors = credits.crew.filter((c) => c.job === "Director");
    const writers = credits.crew.filter(
      (c) => c.job === "Writer" || c.department === "Writing"
    );
    const actors = credits.cast.slice(0, 5);

    return {
      title: details.title,
      year: details.release_date?.split("-")[0],
      runtime: details.runtime,
      genres: details.genres.map((g) => g.name),
      language: details.original_language,
      overview: details.overview,
      directors,
      writers,
      actors,
      poster: details.poster_path,
      backdrop: details.backdrop_path,
      vote_average: details.vote_average.toFixed(1),
    };
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};
