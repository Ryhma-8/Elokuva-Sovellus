import React from 'react'
import Dropdown from 'react-bootstrap/Dropdown'
import 'bootstrap/dist/css/bootstrap.min.css'
import useDropDown from '../components/useDropDown'
import "../css/MoviesPage.css"
import { Card } from 'react-bootstrap'
import Footer from '../components/footer'
import Header from '../components/header'

function MoviesPage() {
  const { genres, reviews, languages, selectedLanguage, setSelectedLanguage, setSelectedGenre, page, totalPages,
          selectedGenre , fetchMoviesByGenre, movies, fetchMoviesByLanguage, fetchMoviesByReview, setSelectedReview, selectedReview } = useDropDown()


  return (
    <>
    <Header></Header>
    <div className="napit">
        <Dropdown>
          <Dropdown.Toggle className="genreNappi rounded-btn" variant="" id="dropdown-basic"> {/* variant="succes" muuttaa napin vihreäksi */}
            Genre {/* jos ei ole mitään variant kohdasssa niin bootstrap laittaa napin siniseksi joten variant="" korjaa ongelman */}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {genres.length > 0 ? (
              genres.map((genre) => (
                <Dropdown.Item
                 key={genre.id}
                 onClick={() => {
                  setSelectedGenre(genre.id) // jos haetaan genren perusteella niin
                  setSelectedLanguage(null) // pitää asettaa nulliksi muut vaihtoehdot ettei tule päällekkäisiä hakuja ja pystyy vaihtamaan lennosta mihin hakukriteetiin tahansa
                  setSelectedReview(null)
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
          <Dropdown.Toggle className="reviewNappi rounded-btn" variant="" id="reviews-dropdown">
            Reviews
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {reviews.length > 0 ? (
              reviews.map((review) => ( //reviews.map käy läpi reviews taulukon elementit jotka tallennetaan review muuttujaan
                <Dropdown.Item
                key={review.label}
                onClick={() => {
                  console.log("Clicked review", review)
                  setSelectedReview(review) // jos haetaan arvostelujen perusteella dropdownista niin
                  setSelectedGenre(null) // pitää asettaa nulliksi muut vaihtoehdot ettei tule päällekkäisiä hakuja ja pystyy vaihtamaan lennosta mihin hakukriteetiin tahansa
                  setSelectedLanguage(null)
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
          <Dropdown.Toggle className="languageNappi rounded-btn" variant="" id="language-dropdown">
            Language
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {languages.length > 0 ? (
            languages.map((lang) => (
              <Dropdown.Item
              key={lang.code} 
              onClick={() => {
                setSelectedLanguage(lang.code) // jos haetaan kielen perusteella dropdownista niin
                setSelectedGenre(null) // pitää asettaa nulliksi muut vaihtoehdot ettei tule päällekkäisiä hakuja ja pystyy vaihtamaan lennosta mihin hakukriteetiin tahansa
                setSelectedReview(null)
              }}>
                {lang.label}
              </Dropdown.Item>
            ))
          ) : (
            <Dropdown.Item disabled>loading...</Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>
        
      </div>
      {/* leffa kortit */}
      <div className="leffa-kortit"> {/* koko korttilistan asetteluun */}
            {movies.length > 0 ? (
                movies.map((movie) => (
                  <Card key={movie.id} style={{ width: "16em" }} className="kortti shadow-sm">
                    <Card.Img
                      variant="top"
                      src={
                        movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "https://via.placeholder.com/300x450?text=No+Image" 
                      }
                      alt={movie.title}
                    />
                    <Card.Body>
                      <Card.Title className="fs-6">{movie.title}</Card.Title> {/* korteille annetaan tiedot (leffan nimi) */}
                      <Card.Text className="text-muted">{movie.release_date ? `(${movie.release_date.substring(0, 4)})` : ""}</Card.Text> {/* korteille annetaan tiedot (julkaisuvuosi) */}
                      <Card.Text>⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "No reviews"}</Card.Text> {/* keskiarvo arvostelusta kahden desimaalin tarkkuudella */}
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
                  if (selectedGenre) fetchMoviesByGenre(selectedGenre, page + 1) // pitää laittaa ehdot tänne myös jotta ohjelma tietää millä sivulla tarvitsee ladata lisää leffoja
                  else if (selectedLanguage) fetchMoviesByLanguage(selectedLanguage, page + 1)
                  else if (selectedReview) fetchMoviesByReview(selectedReview, page + 1)
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
