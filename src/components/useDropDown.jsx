import { useState, useEffect } from 'react'
import axios from 'axios'



function useDropDown() {
  const [genres, setGenres] = useState([])
  const [reviews, setReviews] = useState([ // arvostelut pitää kovakoodata koska apin kautta ei saa suoraan hakua tietylle välille
    { label: "1-2 ⭐", min: 1, max: 2 }, // reviews taulukko
    { label: "2-3 ⭐", min: 2, max: 3 },
    { label: "3-4 ⭐", min: 3, max: 4 },
    { label: "4-5 ⭐", min: 4, max: 5 },
    { label: "5-6 ⭐", min: 5, max: 6 },
    { label: "6-7 ⭐", min: 6, max: 7 },
    { label: "7-8 ⭐", min: 7, max: 8 },
    { label: "8-9 ⭐", min: 8, max: 9 },
    { label: "9-10 ⭐", min: 9, max: 10 },

  ])
  const [languages, setLanguages] = useState([
    { code: "en", label: "English" }, // languages taulukko
    { code: "fi", label: "Suomi" },
    { code: "ja", label: "Japanese" },
    { code: "fr", label: "Français" },
    { code: "sv", label: "Svenska" },
    { code: "de", label: "Deutsch" },
    { code: "es", label: "Español" },
    { code: "zh", label: "Chinese" },
  ])
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedLanguage, setSelectedLanguage] = useState(null)
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [selectedReview, setSelectedReview] = useState(null)

    
  const fetchMoviesByReview = async ({ min, max }, page = 1 ) => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/discover/movie?vote_average.gte=${min}&vote_average.lte=${max}&page=${page}`,
         {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}` 
          }
        }
      )
      if (page === 1) { // jos ollaan ensimmäisellä sivulla niin palauttaa mitä haulla normaalisti löytyisi
      setMovies(response.data.results || [])
      } else {
        setMovies((prev) => [ // prev tallentaa jo haetut leffat niin voi ladata lisää leffoja toistensa perään, muuten vanhat häviäisivät
        ...prev,
        ...(response.data.results || []).filter( // tämä tarkistaa ettei uutta leffaa ole jo listassa niin ei tule dublikaatteja koska react ei tykännyt jos avaimet ei ole uniikkeja
          (newMovie) => !prev.some((m) => m.id === newMovie.id)
        )
      ])
      }

      setTotalPages(response.data.total_pages)
      setPage(page)
    } catch (error) {
      console.log("Error fetching movie reviews", error)
    }
  }


  const fetchMoviesByGenre = async (genreId, page = 1) => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&language=en&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`
          }
        }
      )
      if (page === 1) { // jos ollaan ensimmäisellä sivulla niin palauttaa mitä haulla normaalisti löytyisi
      setMovies(response.data.results || [])
      } else {
        setMovies((prev) => [ // prev tallentaa jo haetut leffat niin voi ladata lisää leffoja toistensa perään, muuten vanhat häviäisivät
        ...prev,
        ...(response.data.results || []).filter( // tämä tarkistaa ettei uutta leffaa ole jo listassa niin ei tule dublikaatteja koska react ei tykännyt jos avaimet ei ole uniikkeja
          (newMovie) => !prev.some((m) => m.id === newMovie.id)
        )
      ])
      }

      setTotalPages(response.data.total_pages)
      setPage(page)
    } catch (error) {
      console.log("Error fetching movies by genre", error)
    }
  }


  const fetchMoviesByLanguage = async (langCode, page = 1) => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/discover/movie?with_original_language=${langCode}&page=${page}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`
          }
        }
      )

      if (page === 1) { // jos ollaan ensimmäisellä sivulla niin palauttaa mitä haulla normaalisti löytyisi
      setMovies(response.data.results || [])
      } else {
        setMovies((prev) => [ // prev tallentaa jo haetut leffat niin voi ladata lisää leffoja toistensa perään, muuten vanhat häviäisivät
        ...prev,
        ...(response.data.results || []).filter( // tämä tarkistaa ettei uutta leffaa ole jo listassa niin ei tule dublikaatteja koska react ei tykännyt jos avaimet ei ole uniikkeja
          (newMovie) => !prev.some((m) => m.id === newMovie.id)
        )
      ])
      }

      setTotalPages(response.data.total_pages)
      setPage(page)
    } catch (error) {
      console.log("Error fetching movies", error)
    }
  }


  const fetchGenres = async () => { // genret voi hakea dropdowniin apin kautta kun ne on saatavilla nätisti
    try {
    const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?&language=en`,
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
    // tarkistetaan ehdoilla, että minkä kriteerin kautta leffoja haetaan

    if (selectedGenre) fetchMoviesByGenre(selectedGenre) // suoritetaan vain yksi ehto niin aaltosulkeita ei tarvita

    else if (selectedReview) fetchMoviesByReview(selectedReview) 

    else if (selectedLanguage) fetchMoviesByLanguage(selectedLanguage)

    else fetchGenres()

    

  }, [selectedLanguage, selectedGenre, selectedReview])


  return {
    genres,
    reviews,
    languages,
    movies,
    selectedLanguage,
    selectedGenre,
    selectedReview,
    fetchMoviesByGenre,
    fetchMoviesByLanguage,
    setSelectedLanguage,
    setSelectedGenre,
    fetchMoviesByReview,
    setSelectedReview,
    page,
    totalPages
  }
}

export default useDropDown