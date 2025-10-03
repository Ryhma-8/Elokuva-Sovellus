import { pool } from '../helpers/db.js'

export async function addFavorite(accountId, movieId) {
  const sql = `
    INSERT INTO public."Favorites" (account_id, movie_id)
    VALUES ($1, $2)
    RETURNING id, account_id, movie_id;
  `
  const { rows } = await pool.query(sql, [accountId, movieId])
  return rows[0]
}

export async function listFavorites(accountId) {
  const sql = `
    SELECT id, movie_id
    FROM public."Favorites"
    WHERE account_id = $1
    ORDER BY id DESC;
  `
  const { rows } = await pool.query(sql, [accountId])
  return rows
}

export async function deleteFavoriteById(id, accountId) {
  const sql = `
    DELETE FROM public."Favorites"
    WHERE id = $1 AND account_id = $2
    RETURNING id;
  `
  const { rows } = await pool.query(sql, [id, accountId])
  return rows[0] || null
}

export async function deleteFavoriteByMovieId(movieId, accountId) {
  const sql = `
  DELETE FROM public. "Favorites"
  WHERE movie_id = $1 AND account_id = $2
  RETURNING movie_id;
  `
  const { rows } = await pool.query(sql, [movieId, accountId])
  return rows[0] || null
}