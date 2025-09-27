
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/useUser";
import "../css/profileBlock.css";
import { deleteAccount } from "../services/deleteAccount";

export default function ProfileBlock() {
  const navigate=useNavigate()
  const { user, setUser } = useUser();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Deleted account!");
    deleteAccount(setUser)
    navigate("/");
  };

  return (
    <div className="profile-block">
        <div className= "profile-content">
            <h2 className="profile-title">Profile</h2>
            <p className="username">Username: {user.username}</p>
            <p className="user-email">{user.email}</p>
        </div>
        <div className="delete-block">
            <button className="delete-button" onClick={handleSubmit}>Delete account</button>
        </div>
    </div>
  );
}