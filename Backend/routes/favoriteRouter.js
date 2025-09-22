import { Router } from 'express'
import { auth } from '../helpers/auth.js'
import {
  addFavoriteController,
  listFavoritesController,
  deleteFavoriteByIdController
} from '../controllers/favoriteController.js'

const router = Router()

// Kaikki suosikkireitit vaativat kirjautumisen
router.use(auth)

// POST /api/favorites
router.post('/', addFavoriteController)

// GET /api/favorites
router.get('/', listFavoritesController)

// DELETE /api/favorites/:id
router.delete('/:id', deleteFavoriteByIdController)

export default router
