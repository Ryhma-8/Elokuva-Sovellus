import axios from "axios";
import { refreshAccessToken } from "./refreshToken.js";

export const logOut = async (setUser) => {
    try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/logout`,
            { withCredentials: true, headers: { Authorization: `Bearer ${user?.accessToken}` }})
        sessionStorage.removeItem('user');
        setUser({email:"", username:"", accessToken:""});
        return response.data;
    } catch (err) {
        if (err.response?.status === 401) {
            await refreshAccessToken();
            const newUser = JSON.parse(sessionStorage.getItem("user"));
            try {
                const retry = await axios.get(`${import.meta.env.VITE_API_URL}/user/logout`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${newUser?.accessToken}` },
                });
                sessionStorage.removeItem('user');
                setUser({email:"", username:"", accessToken:""});
                return retry.data;
            } catch (retryErr) {
                console.error("Retry after refresh failed", retryErr);
                throw new Error(retryErr.response?.data?.message || 'Logout failed');
            }
    }
        
    }
}

