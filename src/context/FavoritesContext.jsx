import React, { createContext, useContext, useState, useEffect } from 'react'
import { getFavourites , addFavourite, removeFavourite } from '../services/getFavourites'
import { useUser } from '../context/useUser'
import { toast } from 'react-toastify'

const FavoritesContext = createContext()

export const FavoritesProvider = ({ children }) => {
    const { user: currentUser } = useUser()
    const [favouriteMovies, setFavouriteMovies] = useState([])
    
    //haetaan suosikkileffat käyttäjän sisäänkirjautuessa
    useEffect(() => {
      const loadFavourites = async () => {
        try {
            if (!currentUser) return
            const favourites = await getFavourites({ userId: currentUser.id })
            setFavouriteMovies(favourites || [])
        } catch (err) {
            console.error("Error fetching favourites", err)
        }
      }

      loadFavourites()

    }, [currentUser])

    const toggleFavorite = async (movie) => {
        /*console.log(currentUser)
        if (!currentUser) {
            console.warn("User not logged in")
            return
        }*/
        
        try {
            const isFav = favouriteMovies.some((fav) => fav.movie_id === movie.id)

            if (isFav) {
                
                const fav = favouriteMovies.find((f) => f.movie_id === movie.id)
                if (!fav) {
                    console.warn("Favourite not found in local storage", movie.id)
                }

                await removeFavourite(fav.movie_id)
                setFavouriteMovies((prev) => prev.filter((f) => f.movie_id !== movie.id))

                const title = movie.title || fav?.title || "Movie"
                toast.info(`${title} deleted from favourites`)
            } else {
                
                const newFav = await addFavourite({
                    id: movie.id,
                    title: movie.title,
                    poster: movie.poster_path,
                    year: movie.release_date?.split("-")[0],
                    vote_average: movie.vote_average,
                })
                setFavouriteMovies((prev) => [...prev, newFav])
                toast.info(`${movie.title} added to favourites`)
            }
        } catch (err) {
            console.error("Error updating favourite movies", err)
        }
    }
    
    const isFavorite = (movieId) => favouriteMovies.some((fav) => fav.id === movieId)

    return (
        <FavoritesContext.Provider value={{ favouriteMovies, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    )
}

export const useFavorites = () => useContext(FavoritesContext)