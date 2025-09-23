import { pool } from '../helpers/db.js'

export async function insertReview(accountId, movieId, title, description) {
  const sql = `
    INSERT INTO public."Reviews" (movie_id, account_id, description, title)
    VALUES ($1, $2, $3, $4)
    RETURNING id, movie_id, account_id, title, description;
  `
  const { rows } = await pool.query(sql, [movieId, accountId, description, title])
  return rows[0]
}

export async function listReviewsByMovie(movieId, limit = 50, offset = 0) {
  const sql = `
    SELECT id, account_id, movie_id, title, description
    FROM public."Reviews"
    WHERE movie_id = $1
    ORDER BY id DESC
    LIMIT $2 OFFSET $3;
  `
  const { rows } = await pool.query(sql, [movieId, limit, offset])
  return rows
}
