import axios from "axios";

const refreshAccessToken = async () => {
    try {
        const url = import.meta.env.VITE_API_URL
        const response = await axios.get(`${url}/user/refresh`,{
        withCredentials: true
      })
        const newAccessToken = response.headers.authorization.split(" ")[1]
        if (!newAccessToken) throw new Error("No access token returned")
        const user = JSON.parse(sessionStorage.getItem("user")) || {};
        const updatedUser = { ...user, accessToken: newAccessToken };
        sessionStorage.setItem("user", JSON.stringify(updatedUser))
    } catch (err) {
        console.error("Failed to refresh access token", err);
        return null;
    }
    
}

export {refreshAccessToken}