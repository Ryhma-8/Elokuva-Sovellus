import { useEffect, useState } from 'react'
import '../css/App.css'
import MovieBlock from '../components/MovieBlock'
import ReviewCarousel from '../components/ReviewCarousel'
import LeaveReview from '../components/LeaveReview'
function App() {
  
  
  return (
    <>
      <h3>test</h3>
      <MovieBlock movieId={122} />
      <ReviewCarousel />
      <LeaveReview />

    </>
  );
}

export default App
