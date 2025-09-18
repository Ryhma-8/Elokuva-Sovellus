import {Link,useNavigate} from "react-router-dom"
import { useUser } from "../context/useUser"
import '../css/authentication.css'

export const AuthenticationMode = Object.freeze({
    SignIn: 'Login',
    SignUp: 'SignUp'
})

export default function Authentication({authenticationMode}) {
    const { user, setUser, signUp, signIn } = useUser()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        const signFunction = authenticationMode === AuthenticationMode.SignUp ?
        signUp : signIn

        signFunction().then(response => {
            navigate(authenticationMode === AuthenticationMode.SignUp ? '/signin': '/')
        })
        .catch (error => {
            alert(error)
        })
    }


  return (
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

        <input
          type="password"
          className="form-input"
          placeholder="Password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          required
        />

        <button type="submit" className="form-button">
          {authenticationMode === AuthenticationMode.SignIn ? "Login" : "Register"}
        </button>

        <Link className="auth-link"
          to={authenticationMode === AuthenticationMode.SignIn ? "/signup" : "/signin"}
        >
          {authenticationMode === AuthenticationMode.SignIn
            ? "No account? Sign up"
            : "Already signed up? Sign in"}
        </Link>
        </div>
      </form>
    </div>
  )
}
