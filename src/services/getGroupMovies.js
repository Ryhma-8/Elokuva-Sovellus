import axios from "axios";
import { refreshAccessToken } from "./refreshToken.js";
import { data } from "react-router-dom";

export const getGroupMovies = async ({ groupId }) => {
  let url = `${import.meta.env.VITE_API_URL}/api/group/get_movies/${groupId}`;

  try {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const headers = user ? { Authorization: `Bearer ${user.accessToken}` } : {};

    const response = await axios.get(url, {
      withCredentials: true,
      headers,
    });

    return response.data.result;
  } catch (err) {
    if (err.response?.status === 401) {
      await refreshAccessToken();
      const user = JSON.parse(sessionStorage.getItem("user"));
      const retry = await axios.get(url, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      return retry.data.result;
    }
    console.error("Failed to get group movies", err);
    throw err;
  }
};
export const addGroupMovie = async (movie, groupId) => {
  const url = `${import.meta.env.VITE_API_URL}/api/group/add_movie`;

  if (!groupId) throw new Error("groupId is undefined");

  try {
    const user = JSON.parse(sessionStorage.getItem("user"));

    const payload = {
      groupId: groupId,
      movieId: movie.id,
    };

    const response = await axios.post(url, payload, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${user.accessToken}` },
    });

    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      await refreshAccessToken();
      const user = JSON.parse(sessionStorage.getItem("user"));
      const retry = await axios.post(url, payload, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      return retry.data;
    }
    console.error("Failed to add group movie", err);
    throw err;
  }
}


export const removeGroupMovie = async (movieId, groupId) => {
  const url = `${import.meta.env.VITE_API_URL}/api/group/delete_movie`;
  try {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const response = await axios.delete(url,
      {
        withCredentials: true,
        headers: { Authorization: `Bearer ${user.accessToken}` },
        data: { movieId, groupId },
      })
    console.log("Removed movie:", response.data)
    return response.data
  }
  catch (err) {
    console.error("Removing group movie failed", err)
    throw err
  }
}