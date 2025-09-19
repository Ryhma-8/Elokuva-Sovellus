import "../css/profileBlock.css";

export default function ProfileBlock() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Deleted account!");
  };

  return (
    <div className="profile-block">
        <div className= "profile-content">
            <h2 className="profile-title">Profile</h2>
            <p className="username">Username: user123</p>
            <p className="user-email">consumer@example.com</p>
            <div className="profile-buttons">
                <button className="log-out-button">Log out</button>
                <button className="delete-button" onClick={handleSubmit}>Delete account</button>
            </div>

        </div>
    </div>
  );
}