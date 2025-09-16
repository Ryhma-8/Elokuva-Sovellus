import { useEffect, useState } from 'react'
import '../css/App.css'
import MovieBlock from '../components/MovieBlock'
import ReviewCarousel from '../components/ReviewCarousel'
import LeaveReview from '../components/LeaveReview'
import SignIn from '../components/SignIn'
function App() {
  
  
  return (
    <>
      <SignIn />
      <MovieBlock movieId={122} />
      <ReviewCarousel />
      <LeaveReview />

    </>
  );
}

export default App
