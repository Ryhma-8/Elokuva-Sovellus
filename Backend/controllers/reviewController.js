import { ApiError } from '../helpers/apiErrorClass.js'
import { insertReview, listReviewsByMovie } from '../models/reviewModel.js'
import { userExists } from '../models/userModel.js'

async function resolveAccountId(req) {
  if (req.user?.id) return req.user.id
  const email = req.user?.user || req.user?.email
  if (!email) throw new ApiError('Unauthorized', 401)
  const result = await userExists(email)
  if (!result?.rows?.length) throw new ApiError('Unauthorized', 401)
  return result.rows[0].id
}

function parsePositiveInt(x) {
  const n = Number(x)
  return Number.isInteger(n) && n > 0 ? n : null
}

// tulkitsee ratingin valinnaisena 1..5
function parseOptionalRating(x) {
  if (x === undefined || x === null || x === '') return null
  const n = Number(x)
  if (!Number.isInteger(n) || n < 1 || n > 5) return undefined // invalid
  return n
}

// POST /api/reviews
export async function addReviewController(req, res, next) {
  try {
    const accountId = await resolveAccountId(req)

    const movieId = parsePositiveInt(req.body?.movie_id)
    if (!movieId) return next(new ApiError('movie_id must be a positive integer', 400))

    let description = (req.body?.description ?? '').toString().trim()
    if (description.length < 1 || description.length > 250) {
      return next(new ApiError('description must be 1–250 characters', 400))
    }

    const title = (req.body?.title ?? '').toString() // title ei UI:ssa, mutta DB vaatii NOT NULL
    const rating = parseOptionalRating(req.body?.rating)
    if (rating === undefined) return next(new ApiError('rating must be an integer between 1 and 5', 400))

    const row = await insertReview(accountId, movieId, title, description, rating )
    return res.status(201).json(row)
  } catch (err) {
    return next(err)
  }
}

// GET pysyy samana (palauttaa nyt myös ratingin)
export async function listReviewsByMovieController(req, res, next) {
  try {
    const movieId = parsePositiveInt(req.query?.movie_id)
    if (!movieId) return next(new ApiError('movie_id is required and must be a positive integer', 400))

    const limit = parsePositiveInt(req.query?.limit) ?? 50
    const offset = parsePositiveInt(req.query?.offset) ?? 0

    const rows = await listReviewsByMovie(movieId, limit, offset)
    return res.json(rows)
  } catch (err) {
    return next(err)
  }
}
