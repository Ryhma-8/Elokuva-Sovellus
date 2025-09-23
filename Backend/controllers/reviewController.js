import { ApiError } from '../helpers/apiErrorClass.js'
import { insertReview, listReviewsByMovie } from '../models/reviewModel.js'
import { userExists } from '../models/userModel.js'

// ratkaisee account_id tokenista (email -> id)
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

    // title ei näy UI:ssa
    const title = (req.body?.title ?? '').toString()

    const row = await insertReview(accountId, movieId, title, description)
    return res.status(201).json(row)
  } catch (err) {
    return next(err)
  }
}

// GET /api/reviews?movie_id=550&limit=20&offset=0  (julkinen)
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
