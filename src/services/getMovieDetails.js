import axios from "axios"


export const getMovieDetails = async (movieId) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, {
            headers: {
                Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`
            }
        })
        return response.data
    } catch (err) {
        console.error("Failed to get movie details", movieId, err)
        throw err
    }
}