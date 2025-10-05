import {useState} from 'react'
import {UserContext} from './UserContext.jsx'
import axios from 'axios'


export default function UserProvider({children}) {
    const userFromStorage = sessionStorage.getItem('user')
    const [user, setUser] = useState(userFromStorage ? JSON.parse(userFromStorage) : {email: '' ,password:'', accessToken:''})

    const signUp = async () => {
        const headers = {headers: {'Content-Type': 'application/json'}}
        await axios.post(`${import.meta.env.VITE_API_URL}/user/register`,{email: user.email, username: user.username, password: user.password },{
        headers, withCredentials: true
      }
      )
      setUser({ email: '', username: '', password: '' })
    }

    const signIn = async () => {
        const headers = {headers: {'Content-Type': 'application/json'}}
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/login`,{email: user.email, password: user.password },{
        headers, withCredentials: true
      }
      )
      const newAccessToken=response.headers.authorization.split(" ")[1]
      setUser({...response.data, accessToken: newAccessToken})
      const userWithToken = {...response.data, accessToken: newAccessToken}
      sessionStorage.setItem('user', JSON.stringify(userWithToken))
    }
  
    return (
        <UserContext.Provider value={{user, setUser, signUp, signIn}}>
            {children}
        </UserContext.Provider>)
}
