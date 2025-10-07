import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import MovieBlock from "../components/moviePageComponents/MovieBlock";
import ReviewCarousel from "../components/moviePageComponents/ReviewCarousel";
import LeaveReview from "../components/moviePageComponents/LeaveReview";
import Header from "../components/header";
import Footer from "../components/footer";
import Recommendations from "../components/moviePageComponents/Recommendations";

const MoviePage = () => {
  const location = useLocation();
  const { movieId } = location.state || {};

  const [refreshTick, setRefreshTick] = useState(0);
  const bump = () => setRefreshTick(t => t + 1);

  // väliaikainen title

  return (
    <div>
      <Header />
        <MovieBlock movieId={movieId} />
        <ReviewCarousel movieId={movieId} refreshTick={refreshTick} />
        <LeaveReview movieId={movieId} onReviewSent={bump} />
        <Recommendations movieId={movieId}/>
      <Footer />
    </div>
  );
};

export default MoviePage;
