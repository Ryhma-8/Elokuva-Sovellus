import { useEffect, useState } from 'react'
import movieSearch from '../services/simpleMovieSearch'
import MoviesList from '../components/HeroBlock/movieList'
import SearchBar from '../components/HeroBlock/searchBar'
import '../css/App.css'
import Header from '../components/header'
import Footer from '../components/footer'


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
      <Header />
      <h3>Search for movies</h3>
      <SearchBar setMovieName={setMovieName} movieName={movieName} onSearch={handleSearch} onKeyPress={handleSearch} placeholder={"Search"} />
      <MoviesList movies={movies} />
      <Footer />
    </>
  )
}

export default LandingPage
