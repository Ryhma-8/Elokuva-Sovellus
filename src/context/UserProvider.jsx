import { useState } from 'react';
import { UserContext } from './UserContext.jsx';
import axios from 'axios';

export default function UserProvider({ children }) {
  const userFromStorage = sessionStorage.getItem('user');
  const [user, setUser] = useState(
    userFromStorage ? JSON.parse(userFromStorage) : null
  );

  const signUp = async (formData) => {
    const headers = { headers: { 'Content-Type': 'application/json' } };
    await axios.post(
      `${import.meta.env.VITE_API_URL}/user/register`,
      {
        email: formData.email,
        username: formData.username,
        password: formData.password
      },
      { headers, withCredentials: true }
    );
  };

  const signIn = async (formData) => {
    const headers = { headers: { 'Content-Type': 'application/json' } };
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/user/login`,
      {
        email: formData.email,
        password: formData.password
      },
      { headers, withCredentials: true }
    );

    const newAccessToken = response.headers.authorization.split(" ")[1];
    const userWithToken = { ...response.data, accessToken: newAccessToken };
    
    setUser(userWithToken);
    sessionStorage.setItem('user', JSON.stringify(userWithToken));
  };

  return (
    <UserContext.Provider value={{ user, setUser, signUp, signIn }}>
      {children}
    </UserContext.Provider>
  );
}
