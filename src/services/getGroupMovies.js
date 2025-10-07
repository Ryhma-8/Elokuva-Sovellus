import axios from "axios";

export const getGroupMovies = async (groupId) => {
    try {
        const response = await axios.get(`/group/movies/${groupId}`, {
            headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`
            }
        });
        return response.data;
    } catch (err) {
        console.error("Failed to get group movies", groupId, err);
        throw err;
    }
    }