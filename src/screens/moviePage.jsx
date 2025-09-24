import React, { useState } from "react";
import { useParams } from "react-router-dom";
import MovieBlock from "../components/moviePageComponents/MovieBlock";
import ReviewCarousel from "../components/moviePageComponents/ReviewCarousel";
import LeaveReview from "../components/moviePageComponents/LeaveReview";
import Header from "../components/header";
import Footer from "../components/footer";

const MoviePage = () => {
  const params = useParams();
  const routeId = Number(params?.id);
  const movieId = Number.isFinite(routeId) ? routeId : 123;

  const [refreshTick, setRefreshTick] = useState(0);
  const bump = () => setRefreshTick(t => t + 1);

  // väliaikainen title
  const movieTitle = "Movie Title (placeholder)";

  return (
    <div>
      <Header />
        <MovieBlock movieId={movieId} />
        <ReviewCarousel movieId={movieId} movieTitle={movieTitle} refreshTick={refreshTick} />
        <LeaveReview movieId={movieId} onReviewSent={bump} />
      <Footer />
    </div>
  );
};

export default MoviePage;
