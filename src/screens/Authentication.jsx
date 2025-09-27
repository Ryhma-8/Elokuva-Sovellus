import {Link,useNavigate} from "react-router-dom"
import { useUser } from "../context/useUser"
import '../css/authentication.css'
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react" 
import Header from "../components/header"
import Footer from "../components/footer"

export const AuthenticationMode = Object.freeze({
    SignIn: 'SignIn',
    SignUp: 'SignUp'
})

export default function Authentication({authenticationMode}) {
    const { user, setUser, signUp, signIn } = useUser()
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        const signFunction = authenticationMode === AuthenticationMode.SignUp ?
        signUp : signIn

        signFunction().then(response => {
            navigate(authenticationMode === AuthenticationMode.SignUp ? '/login': '/')
        })
        .catch (error => {
            alert(error)
        })
    }


  return (
  <div>
    <Header></Header>
    <div className="form-wrapper">
      <div className="form-background">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-fields">
          <h2 className="form-h2">
            {authenticationMode === AuthenticationMode.SignIn ? "Sign In" : "Sign Up"}
          </h2>

          <input
            type="email"
            className="form-input"
            placeholder="Email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            required
          />

          {authenticationMode === AuthenticationMode.SignUp && (
            <input
              type="text"
              className="form-input"
              placeholder="Username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              required
            />
          )}
      <div className="password-field">
        <input
          type={showPassword ? "text" : "password"}
          className="form-input"
          placeholder="Password"
          {...(authenticationMode===AuthenticationMode.SignUp
            ? {
              pattern:"(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}",
              title:"Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
            }
            : {})}
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          required
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
        </button>
      </div>

      <div className="button-container">  
        <button type="submit" className="form-button">
          {authenticationMode === AuthenticationMode.SignIn ? "Login" : "Register"}
        </button>
      </div>  
        <Link className="auth-link"
          to={authenticationMode === AuthenticationMode.SignIn ? "/register" : "/login"}
        >
          {authenticationMode === AuthenticationMode.SignIn
            ? "No account? Sign up"
            : "Already signed up? Sign in"}
        </Link>
      </div>
      </form>
    </div>
  </div>
  <Footer></Footer>
</div>
  )
}
