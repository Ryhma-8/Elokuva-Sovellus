import { Router } from 'express'
import { auth } from '../helpers/auth.js'
import {
  addFavoriteController,
  listFavoritesController,
  listFavoritesShareController,
  deleteFavoriteByIdController,
  deleteFavoriteByMovieIdController
} from '../controllers/favoriteController.js'

const router = Router()

// POST /api/favorites
router.post('/',auth, addFavoriteController)

// GET /api/favorites
router.get('/',auth, listFavoritesController)

// GET /api/favorites/share/:id
router.get('/share/:id', listFavoritesShareController)

// DELETE /api/favorites/:id
router.delete('/:id',auth, deleteFavoriteByIdController)

// DELETE /api/favorites/movie/:movie_id
router.delete('/movie/:movie_id', auth, deleteFavoriteByMovieIdController)

export default router
