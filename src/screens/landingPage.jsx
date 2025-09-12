import { useEffect, useState } from 'react'
import movieSearch from '../services/simpleMovieSearch'
import MoviesList from '../components/HeroBlock/movieList'
import SearchBar from '../components/HeroBlock/searchBar'
import '../css/HeroBlock.css'
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
      <div className="hero-block">
        <div className="hero-search">
          <h2 className="hero-title">Search for movies</h2>
          <SearchBar setMovieName={setMovieName} movieName={movieName} placeholder="Search" onSearch={handleSearch} onKeyPress={handleSearch} />
        </div>
        <div className="hero-results">
          <MoviesList movies={movies} />
        </div>
</div>
    <Footer />
    </>
  )
}

export default LandingPage
