import React from 'react'
import Dropdown from 'react-bootstrap/Dropdown'
import 'bootstrap/dist/css/bootstrap.min.css'
import useDropDown from '../components/useDropDown'
import '../css/MoviesPage.css'


function MoviesPage() {
  const { genres, reviews, languages, selectedLanguage, setSelectedLanguage, setSelectedGenre, selectedGenre , fetchMoviesByGenre, movies } = useDropDown()


  return (
    <><header className="header-tila">
      <h3>Sample</h3>
    </header><div className="d-flex gap-3 p-3">
        <Dropdown>
          <Dropdown.Toggle className="genreNappi rounded-btn" variant="" id="dropdown-basic"> {/* variant="succes" muuttaa napin vihreäksi */}
            Genre {/* jos ei ole mitään variant kohdasssa niin bootstrap laittaa napin siniseksi joten variant="" korjaa ongelman */}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {genres.length > 0 ? (
              genres.map((genres) => (
                <Dropdown.Item
                 key={genres.id}
                 onClick={() => {
                  setSelectedGenre(genres.id)
                  fetchMoviesByGenre(genres.id)
                 }}> {/* React tarvitsee uniikin keyn jokaiselle listan ID:lle, jotta se osaa päivittää näkymän tehokkaasti. */}
                  {genres.name} {/* href={#/genre/${genre.id}} tekee jokaiselle itemille oman linkin genren ID:en mukaan */}
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
              reviews.map((review) => (
                <Dropdown.Item key={review.id} className="text-wrap">
                  <strong>{review.author}</strong>: {review.content.substring(0, 100)} {/* arvostelun jättäjä on bold fontilla (<strong>{review.author}</strong>) */}
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
            {languages.map((lang) => (
              <Dropdown.Item key={lang.code} onClick={() => setSelectedLanguage(lang.code)}>
                {lang.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {/* leffa lista */}
      <div className="leffa-lista">
            {movies.length > 0 ? (
              <ul>
                {movies.map((movie) => (
                  <li key={movie.id}>
                    {movie.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No movies found</p>
            )}
      </div>
      </>
      
  )
}

export default MoviesPage