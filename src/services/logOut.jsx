import axios from "axios";
 
export const logOut = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/logout`, { withCredentials: true });
        sessionStorage.removeItem('user');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Logout failed');
    }
}
 
 
 