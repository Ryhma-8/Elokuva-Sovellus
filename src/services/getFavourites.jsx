import axios from "axios";
import {refreshAccessToken} from "../services/refreshToken.js"


const API_URL = import.meta.env.VITE_API_URL;

export const getFavourites = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    console.log(user)
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/favorites`, { withCredentials: true, headers: {Authorization: `Bearer ${user?.accessToken}`} });

  console.log(response)
  if (response.status===401) {
    await refreshAccessToken()
    const user = JSON.parse(sessionStorage.getItem('user'))

    const newR = await axios.get(`${import.meta.env.VITE_API_URL}/api/favorites`, { withCredentials: true,
    headers: {Authorization: `Bearer ${user?.accessToken}`} });
    console.log(newR)
    return newR.data;
  }

  return response.data;
};