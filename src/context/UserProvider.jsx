import {useState} from 'react'
import {UserContext} from './UserContext.jsx'
import axios from 'axios'

export default function UserProvider({children}) {
    const userFromStorage = sessionStorage.getItem('user') // Vaihdetaanko localstorageksi?
    const [user, setUser] = useState(userFromStorage ? JSON.parse(userFromStorage) : {email: '' ,password:''})

    const signUp = async () => {
        const headers = {headers: {'Content-Type': 'application/json'}}
        await axios.post(`${import.meta.env.VITE_API_URL}/user/register`,{email: user.email, username: user.username, password: user.password },
        headers
      )
      setUser({ email: '', username: '', password: '' })
    }

    const signIn = async () => {
        const headers = {headers: {'Content-Type': 'application/json'}}
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/login`,{email: user.email, password: user.password },
        headers
      )
      setUser(response.data)
      sessionStorage.setItem('user', JSON.stringify(response.data))
    }

    return (
        <UserContext.Provider value={{user, setUser, signUp, signIn}}>
            {children}
        </UserContext.Provider>)
}