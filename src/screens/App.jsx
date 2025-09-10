import { useEffect, useState } from 'react'
import movieSearch from '../services/simpleMovieSearch'
import MoviesList from '../components/HeroBlock/movieList'
import '../css/App.css'

function App() {
  const [movies, setMovies] = useState([])
  useEffect(() => {
    async function getMovies(){
      const result = await movieSearch("star wars")
      setMovies(result)
    }
    getMovies()
  },[])
  
  return (
    <>
      <h3>test</h3>
        <MoviesList movies={movies} />
    </>
  )
}

export default App
