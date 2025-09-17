import { useState, useEffect } from 'react'
import axios from 'axios'



function useDropDown() {
  const [genres, setGenres] = useState([])
  const [reviews, setReviews] = useState([])
  const [languages, setLanguages] = useState([
    { code: "en", label: "English" },
    { code: "fi", label: "Suomi" },
    { code: "ja", label: "Japanese" },
    { code: "fr", label: "Français" },
    { code: "sv", label: "Svenska" },
    { code: "de", label: "Deutsch" },
    { code: "es", label: "Español" },
    { code: "zh", label: "Chinese" },
  ])
  const [movies, setMovies] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState(null)
  const [selectedGenre, setSelectedGenre] = useState(null)

    



  const fetchMoviesByGenre = async (genreId) => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&language=en`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`
          }
        }
      )
      setMovies(response.data.results || [])
    } catch (error) {
      console.log("Error fetching movies by genre", error)
    }
  }


  const fetchMoviesByLanguage = async (langCode) => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/discover/movie?with_original_language${langCode}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`
          }
        }
      )
      setMovies(response.data.results || [])
    } catch (error) {
      console.log("Error fetching movies", error)
    }
  }



  const fetchReviews = async (movieId) => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/reviews?language=en`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`
        }
      }
    )
      const sortedReviews = (response.data.results || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at) // järjestetään arvostelut uusimmasta vanhimpaan 
      )
      setReviews(sortedReviews)
    } catch (error) {
      console.log("Error fetching reviews", error)
    }
  }
  
  
  const fetchGenres = async () => {
    try {
    const response = await axios.get('https://api.themoviedb.org/3/genre/movie/list?api_key=&language=en', // tässä pitää luoda response muuttuja, muuten tulee virhe response not defined
      {
        headers: { 
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`
          
        }
      }
    )
      setGenres(response.data.genres || []) // jos dataa löytyy se tallennetaan genres taulukkoon or "||" palautetaan tyhjä taulukko jos dataa ei löydy että ohjelma ei kaadu
      } catch (error) {
        console.log("Error fetching genres", error)
      }
    } 

  
  
  useEffect(() => {

    
    fetchGenres()
    fetchReviews(550)
    if (selectedLanguage) {
      fetchMoviesByLanguage(selectedLanguage)
    }
  }, [])

  return {
    genres,
    reviews,
    languages,
    movies,
    selectedLanguage,
    selectedGenre,
    fetchMoviesByGenre,
    setSelectedLanguage,
    setSelectedGenre,

  }
}

export default useDropDown