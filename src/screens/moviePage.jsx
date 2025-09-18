import React from "react";
<<<<<<< HEAD
import MovieBlock from "../components/MovieBlock";
import ReviewCarousel from '../components/ReviewCarousel'
import LeaveReview from '../components/LeaveReview'
=======
import MovieBlock from "../components/moviePageComponents/MovieBlock";
import ReviewCarousel from "../components/moviePageComponents/ReviewCarousel";
import LeaveReview from "../components/moviePageComponents/LeaveReview";

>>>>>>> 2bbf176 (This commit includes new screen Authentication.jsx and the basic profile page)
import Header from "../components/header";
import Footer from "../components/footer";

const MoviePage = () => {
  return (
    <div>
        <MovieBlock movieId={121} />
        <ReviewCarousel />
        <LeaveReview />
<<<<<<< HEAD
      </div>
      
      <Footer /> 
    </>
=======

    </div>
>>>>>>> 2bbf176 (This commit includes new screen Authentication.jsx and the basic profile page)
  );
};

export default MoviePage;
