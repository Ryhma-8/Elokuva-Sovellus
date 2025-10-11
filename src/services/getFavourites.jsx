import axios from "axios";
import { refreshAccessToken } from "../services/refreshToken.js"

export const getFavourites = async ({userId}) => {
  let url = `${import.meta.env.VITE_API_URL}/api/favorites`;

  if (userId) {
    url = `${import.meta.env.VITE_API_URL}/api/favorites/share/${userId}`;

  try {
    const user = console.log("Current user before request" ,JSON.parse(sessionStorage.getItem("user")));

    const headers = userId ? {} : { Authorization: `Bearer ${user?.accessToken}` };
 
    const response = await axios.get(url, {
      withCredentials: true,
      headers,
    });
    console.log(response.data)
    return response.data;

  } catch (err) {
    if (err.response?.status === 401 && !userId) {
      await refreshAccessToken();
      const user = JSON.parse(sessionStorage.getItem("user"));

      try {
        const retry = await axios.get(url, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        });
        console.log(retry.data)
        return retry.data;
      } catch (retryErr) {
        console.error("Retry after refresh failed", retryErr);
        throw new Error("Login required");
      }
    }

    console.error("getFavourites failed", err);
    throw err;
  }
};
}
export const addFavourite = async (movie, userId) => {
  const url = `${import.meta.env.VITE_API_URL}/api/favorites`

  try {
    const user = JSON.parse(sessionStorage.getItem("user"))

    const payload = {
      movie_id: movie.id,
      title: movie.title,
      poster: movie.poster_path || movie.poster,
      year: movie.release_date ? movie.release_date.substring(0, 4) : null,
      vote_average: movie.vote_average,
      user_id: userId
    }



    const response = await axios.post(url, payload, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${user?.accessToken}` }
    })
    
    return response.data
  } catch (err) {
    if (err.response?.status === 401) {
      alert("Please log in to manage favourites")
    }
    console.error("Adding movie failed", err)
    throw err
  }
}

export const removeFavourite = async (movieId) => {
  const url = `${import.meta.env.VITE_API_URL}/api/favorites/movie/${movieId}`

  try {
    const user = JSON.parse(sessionStorage.getItem("user"))
    const response = await axios.delete(url, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${user?.accessToken}` }
    })
    console.log("Removed movie", response.data)
    return response.data
  } catch (err) {
    console.error("Removing movie failed", err)
    throw err
  }
}