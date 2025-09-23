import React from "react";
import ProfileBlock from "../components/ProfileBlock";
import { UserContext } from "../context/UserContext";
import { Navigate } from "react-router-dom";

const ProfilePage = () => {
  const {user} = React.useContext(UserContext);

  if 
(!user || !user.accessToken) {
    return <Navigate to ="/login" replace />;
  }
  return (
    <div>
      <ProfileBlock />
    </div>
  );
};

export default ProfilePage;