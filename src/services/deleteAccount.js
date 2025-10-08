import axios from "axios";
import { refreshAccessToken } from "./refreshToken";

const deleteAccount = async(setUser) => {
    try {
        const user = JSON.parse(sessionStorage.getItem('user'))
        const headers = {
        Authorization: `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json',
        }
        console.log(`${import.meta.env.VITE_API_URL}/user/delete`)
        console.log(user.email)
        const response = await axios.delete(`${import.meta.env.VITE_API_URL}/user/delete`, {headers,  withCredentials: true });
        setUser({email:"", username:"", accessToken:""});
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            await refreshAccessToken()
            //await new Promise((r) => setTimeout(r, 300))
            const newUser = JSON.parse(sessionStorage.getItem('user'))
            const headers = {
            Authorization: `Bearer ${newUser.accessToken}`,
            'Content-Type': 'application/json',
            }
            const newResponse = await axios.delete(`${import.meta.env.VITE_API_URL}/user/delete`, {headers,  withCredentials: true }); 
            sessionStorage.removeItem('user');
            setUser({email:"", username:"", accessToken:""});
            return newResponse.data;
        }
        throw new Error(error.response?.data?.message || 'delete failed');
    }
}

export {deleteAccount}