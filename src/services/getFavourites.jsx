import axios from "axios";
import { refreshAccessToken } from "../services/refreshToken.js"

export const getFavourites = async ({ userId, groupId} = {}) => {
  let url = `${import.meta.env.VITE_API_URL}/api/favorites`;

  // Tämä voisi olla julkiseen hakuun?
  if (userId) {
    url = `${import.meta.env.VITE_API_URL}/api/favorites/share/${userId}`;

    // Ryhmien suosikkien hakuun jotain vastaavaa???
  } else if (groupId) {
    url = `${import.meta.env.VITE_API_URL}/api/groups/${groupId}/favorites`;
  }

  try {
    const user = JSON.parse(sessionStorage.getItem("user"));

    const headers= userId
     ? {} : { Authorization: `Bearer ${user?.accessToken}` };

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