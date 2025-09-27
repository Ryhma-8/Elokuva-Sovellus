import { ApiError } from '../helpers/apiErrorClass.js'
import {
  addFavorite,
  listFavorites,
  deleteFavoriteById
} from '../models/favoriteModel.js'
import { userExists } from '../models/userModel.js'

// Yritetään saada account_id joko tokenin id:stä tai sähköpostista
async function resolveAccountId(req) {
  
  if (req.user?.id) return req.user.id

  // Login tekee muodossa { user: email }
  const email = req.user?.user || req.user?.email
  if (!email) throw new ApiError('Unauthorized', 401)

  const result = await userExists(email)
  if (!result?.rows?.length) throw new ApiError('Unauthorized', 401)

  return result.rows[0].id
}

function parsePositiveInt(value) {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) return null
  return n
}

// POST /api/favorites
export async function addFavoriteController(req, res, next) {
  try {
    const accountId = await resolveAccountId(req)
    const movieId = parsePositiveInt(req.body?.movie_id)
    if (!movieId) return next(new ApiError('No movie id', 400))

    const row = await addFavorite(accountId, movieId)
    return res.status(201).json(row)
  } catch (err) {
    if (err?.code === '23505') {
      return next(new ApiError('Movie already in favorites', 409))
    }
    return next(err)
  }
}

// GET /api/favorites
export async function listFavoritesController(req, res, next) {
  try {
    const accountId = await resolveAccountId(req)
    const rows = await listFavorites(accountId)
    return res.json(rows)
  } catch (err) {
    return next(err)
  }
}

// DELETE /api/favorites/:id
export async function deleteFavoriteByIdController(req, res, next) {
  try {
    const accountId = await resolveAccountId(req)
    const id = parsePositiveInt(req.params?.id)
    if (!id) return next(new ApiError('Invalid favorite id', 400))

    const deleted = await deleteFavoriteById(id, accountId)
    if (!deleted) return next(new ApiError('Favorite not found', 404))
    return res.status(204).send()
  } catch (err) {
    return next(err)
  }
}
