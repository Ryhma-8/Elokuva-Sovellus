import React from "react";
import ProfileBlock from "../components/ProfileBlock";
import { UserContext } from "../context/UserContext";
import { Navigate } from "react-router-dom";
import Header from "../components/header"
import Footer from "../components/footer"
import FavouriteList from "../components/FavouriteList";

const ProfilePage = () => {
  const {user} = React.useContext(UserContext);

  if 
(!user || !user.accessToken) {
    return <Navigate to ="/login" replace />;
  }
  return (
    <div>
      <Header />
      <ProfileBlock />
      <FavouriteList />
      <Footer></Footer>
    </div>
  );
};

export default ProfilePage;