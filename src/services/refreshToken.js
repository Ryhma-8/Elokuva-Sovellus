import axios from "axios";

const refreshAccessToken = async () => {
    const url = import.meta.env.VITE_API_URL
    const response = await axios.get(`${url}/user/refresh`,{
        withCredentials: true
      })
    const newAccessToken = response.headers.authorization.split(" ")[1]
    console.log(newAccessToken)
    const user = JSON.parse(sessionStorage.getItem("user"));
    const updatedUser = { ...user, accessToken: newAccessToken };
    sessionStorage.setItem("user", JSON.stringify(updatedUser))
}

export {refreshAccessToken}