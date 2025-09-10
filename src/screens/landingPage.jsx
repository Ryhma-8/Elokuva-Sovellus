import { use, useEffect, useState } from 'react'
import movieSearch from '../services/simpleMovieSearch'
import MoviesList from '../components/HeroBlock/movieList'
import SearchBar from '../components/HeroBlock/searchBar'
import '../css/App.css'

function LandingPage() {
    const [movieName, setMovieName] = useState("")
    const [movies, setMovies] = useState([])

    useEffect(() => {
        const preLoad = async () => {
            const results = await movieSearch("Dune");
            setMovies(results);
        }
        preLoad();
    }, [])

    const handleSearch = async () => {
        if (movieName.trim() === "") return;
        const results = await movieSearch(movieName);
        setMovies(results);
    }

  return (
    <>
      <h3>test</h3>
      <SearchBar setMovieName={setMovieName} movieName={movieName} onSearch={handleSearch} />
      <MoviesList movies={movies} />
    </>
  )
}

export default LandingPage
