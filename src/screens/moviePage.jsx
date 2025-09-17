import React from "react";
import MovieBlock from "../components/MovieBlock";

import Header from "../components/header";
import Footer from "../components/footer";

const MoviePage = () => {
  return (
    <>
      <Header /> 
      <div>
        <MovieBlock movieId={121} />
      </div>
      <Footer /> 
    </>
  );
};

export default MoviePage;
