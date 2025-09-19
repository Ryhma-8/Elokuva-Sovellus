import React from "react";
import MovieBlock from "../components/moviePageComponents/MovieBlock";
import ReviewCarousel from "../components/moviePageComponents/ReviewCarousel";
import LeaveReview from "../components/moviePageComponents/LeaveReview";
import Header from "../components/header";
import Footer from "../components/footer";

const MoviePage = () => {
  return (
    <div>
      <Header></Header>
        <MovieBlock movieId={121} />
        <ReviewCarousel />
        <LeaveReview />
      <Footer></Footer>
    </div>
  );
};

export default MoviePage;
