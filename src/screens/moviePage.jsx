import React from "react";
import MovieBlock from "../components/MovieBlock";
import ReviewCarusel from "../components/ReviewCarousel"
import LeaveReview from "../components/LeaveReview"
import Header from "../components/header";
import Footer from "../components/footer";

const MoviePage = () => {
  return (
    <>
      <Header /> 
      <div>
        <MovieBlock movieId={121} />
        <ReviewCarusel/>
        <LeaveReview/>
      </div>
      <Footer /> 
    </>
  );
};

export default MoviePage;
