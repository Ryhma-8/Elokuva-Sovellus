import React from 'react'
import Dropdown from 'react-bootstrap/Dropdown'
import 'bootstrap/dist/css/bootstrap.min.css'
import useDropDown from '../components/useDropDown'
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons'
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons'
import { useFavorites } from '../context/FavoritesContext';
import "../css/MoviesPage.css"
import { Card } from 'react-bootstrap'
import Footer from '../components/footer'
import Header from '../components/header'

function MoviesPage() {
  const { genres, reviews, languages, selectedLanguage, setSelectedLanguage, setSelectedGenre, page, totalPages,
          selectedGenre, fetchMoviesByGenre, movies, fetchMoviesByLanguage, fetchMoviesByReview, setSelectedReview,
          selectedReview, fetchPopularMovies, setSelectedGenreName, selectedGenreName, setSelectedReviewName, selectedReviewName,
          setSelectedLanguageName, selectedLanguageName, /*addFavorite,*/ favorite, search, handleSearch, fetchMoviesBySearch,
          setSearch, tempSearch, setTempSearch } = useDropDown()

  const { isFavorite, toggleFavorite, favouriteMovies } = useFavorites()
  console.log("Favourites from context:", favouriteMovies)


  return (
    <>
    <Header></Header>
    <div className="napit">
        <Dropdown>
          <Dropdown.Toggle className={`genreNappi rounded-btn ${selectedGenreName ? "selected" : ""}`}
          id="dropdown-basic"> {/* variant="succes" muuttaa napin vihreäksi */}
             
             
             {selectedGenreName || "Genre"} {/* jos ei ole mitään variant kohdasssa niin bootstrap laittaa napin siniseksi joten variant="" korjaa ongelman */}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {genres.length > 0 ? (
              genres.map((genre) => (
                <Dropdown.Item
                 key={genre.id}
                 onClick={() => {
                  console.log("Genre click", genre.id, genre.name)
                  setSelectedGenre(genre.id) // dropdowniin haetaan genret ideen perusteella
                  setSelectedGenreName(genre.name) // asetetaan haetun genren nimi nappiin
                  setSelectedLanguageName(null) /* nollataan kieli jos sieltä haettu ennen genreä */
                  setSelectedReviewName(null) /* nollataan arvosteluväli jos sieltä haettu ennen genreä */
                  setSelectedLanguage(null) /* nollataan muut haut ettei tule päällekkäisiä hakuja */
                  setSelectedReview(null)
                  setSearch("") /* lisäys että hakupalkin haku ja input kenttä tyhjennetään jos haetaan tekstihaun jälkeen muilla kriteereillä */
                  setTempSearch("")
                  }}> 
                  {/* React tarvitsee uniikin keyn jokaiselle listan ID:lle, jotta se osaa päivittää näkymän tehokkaasti. */}
                  {genre.name} {/* href={#/genre/${genre.id}} tekee jokaiselle itemille oman linkin genren ID:en mukaan */}
                </Dropdown.Item> /* genres.name tämä näyttää genren nimen sen ID:en perusteella */
              ))
            ) : (
              <Dropdown.Item disabled>loading...</Dropdown.Item> /* jos genrejen lataamisessa kestää niin tämä näyttää väliaikaisesti loading... tesktin */
            )}
          </Dropdown.Menu>
        </Dropdown>

        {/* Reviews dropdown */}
        <Dropdown>
          <Dropdown.Toggle className={`reviewNappi rounded-btn ${selectedReviewName ? "selected" : ""} `}
          id="reviews-dropdown">
            
            
            {selectedReviewName || "Reviews"}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {reviews.length > 0 ? (
              reviews.map((review) => ( //reviews.map käy läpi reviews taulukon elementit jotka tallennetaan review muuttujaan
                <Dropdown.Item
                key={review.label}
                onClick={() => {
                  console.log("Clicked review", review)
                  setSelectedReview(review) /* dropdowniin haetaan tehty taulukko useDropDown tiedostosta */
                  setSelectedReviewName(review.label) /* asetetaan nappiin haettu arvosteluväli */
                  setSelectedGenreName(null) /* nollataan genren nimi jos sieltä haettu ennen arvostelua */
                  setSelectedLanguageName(null) /* nollataan kieli jos sieltä haettu ennen arvostelua */
                  setSelectedGenre(null) /* nollataan muut haut ettei tule päällekkäisiä hakuja */
                  setSelectedLanguage(null)
                  setSearch("") /* lisäys että hakupalkin haku ja input kenttä tyhjennetään jos haetaan tekstihaun jälkeen muilla kriteereillä */
                  setTempSearch("")
                }}>
                   {review.label}
                   {/* arvostelun jättäjä on bold fontilla (<strong>{review.author}</strong>) */}
                </Dropdown.Item> /* {review.content.substring(0, 100)} näyttää sataan merkkiin asti arvostelua */
              ))
            ) : (
              <Dropdown.Item disabled>loading...</Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>

        {/* Languages dropdown */}
        <Dropdown>
          <Dropdown.Toggle className={`languageNappi rounded-btn ${selectedLanguageName ? "selected" : ""}`} /* jos selectedLanguageName valittuna niin nappiin lisätään selected -> (katso css tiedosto)*/
          id="language-dropdown">
            
            
            {selectedLanguageName || "Language"}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {languages.length > 0 ? (
            languages.map((lang) => (
              <Dropdown.Item
              key={lang.code} 
              onClick={() => {
                setSelectedLanguage(lang.code) /* dropdowniin haetaan tehty taulukko useDropDown tiedostosta */
                setSelectedLanguageName(lang.label) /* tallennetaan valittu kieli näkyviin nappiin */
                setSelectedGenreName(null) /* nollataan genren nimi jos sieltä haettu ennen kieltä */
                setSelectedReviewName(null) /* nollataan arvosteluväli jos sieltä haettu ennen kieltä */
                setSelectedGenre(null) /* nollataan muut haut ettei tule päällekkäisiä hakuja */
                setSelectedReview(null)
                setSearch("") /* lisäys että hakupalkin haku ja input kenttä tyhjennetään jos haetaan tekstihaun jälkeen muilla kriteereillä */
                setTempSearch("")
              }}>
                {lang.label}
              </Dropdown.Item>
            ))
          ) : (
            <Dropdown.Item disabled>loading...</Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>

      <div className="haku-palkki">
      <input
      type='text'
      value={tempSearch}
      onChange={(e) => setTempSearch(e.target.value)} /* tempSearch hoitaa että kun input kenttään kirjoitetaan niin hakua ei suoriteta automaattisesti ennekuin painettu enter tai "search" nappia */
      onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }} /* handlesearch suorittaa haun kun painetaan enteriä */
      placeholder='Search movies'
      className='haku-kenttä'
      />

      <button
      className='haku-nappi rounded-btn'
      onClick={handleSearch} /* sama homma mutta jos painetaan "search" nappia  */
      >
        Search
        </button>

    </div>  
        
      </div>
              {movies.length > 0 && !search && !selectedGenre && !selectedLanguage && !selectedReview && ( /* lisätty ehto että sisältää hakupalkin niin että suosittuja leffoja näytetään jos millään kriteetillä ei ole haettu leffoja */
              <h3 className="aloitus-otsikko">Popular right now</h3>
              )}
      {/* leffa kortit */}
      <div className="leffa-kortit"> {/* koko korttilistan asetteluun */}
            {movies.length > 0 ? (
                movies.map((movie) => (
                  <Card key={movie.id} style={{ width: "16em" }} className="kortti shadow-sm">
                    <Link to="/movie"  state={{movieId: movie.id}}>
                      <Card.Img
                        variant="top"
                        src={
                          movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : "https://via.placeholder.com/300x450?text=No+Image" 
                        }
                        alt={movie.title}
                      />
                    </Link>
                    <Card.Body>
                      <Link to="/movie"  state={{movieId: movie.id}}>
                        <Card.Title className="fs-6">{movie.title}</Card.Title> {/* korteille annetaan tiedot (leffan nimi) */}
                      </Link>
                      <Card.Text className="text-muted">{movie.release_date ? `(${movie.release_date.substring(0, 4)})` : ""}</Card.Text> {/* korteille annetaan tiedot (julkaisuvuosi) */}
                      <Card.Text>⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "No reviews"}</Card.Text> {/* keskiarvo arvostelusta kahden desimaalin tarkkuudella */}
                      <button
                        className={`favorite-button ${isFavorite(movie.id) ? "active": ""}`}
                        onClick={() => toggleFavorite(movie)}>
                          <FontAwesomeIcon
                          icon={isFavorite(movie.id) ? solidStar : regularStar}/>
                      </button>
                    </Card.Body>
                  </Card> 
                ))
            ) : (
              <p className="text-muted">No movies found</p>
            )}
            </div>
            {page < totalPages && (
              <div className="load-container">
                <button className="load-button"
                  onClick={() => {
                  if (search) fetchMoviesBySearch(search, page +1)
                  else if (selectedGenre) fetchMoviesByGenre(selectedGenre, page + 1) // pitää laittaa ehdot tänne myös jotta ohjelma tietää millä sivulla tarvitsee ladata lisää leffoja
                  else if (selectedLanguage) fetchMoviesByLanguage(selectedLanguage, page + 1)
                  else if (selectedReview) fetchMoviesByReview(selectedReview, page + 1)
                  else fetchPopularMovies(page + 1)
                }}>
                    Load More
                </button>
              </div>
            )}
      <Footer></Footer>
  </>
      
  )
}

export default MoviesPage
