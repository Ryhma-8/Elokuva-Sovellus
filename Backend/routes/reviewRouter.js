import { Router } from 'express'
import { auth } from '../helpers/auth.js'
import { addReviewController, listReviewsByMovieController } from '../controllers/reviewController.js'

const router = Router()

// Julkinen: listaa tietyn elokuvan arviot ?movie_id=...
router.get('/', listReviewsByMovieController)

// Suojattu: 
router.post('/', auth, addReviewController)

export default router
