import { pool } from '../helpers/db.js'

export async function insertReview(accountId, movieId, title, description, rating ) {
  const sql = `
    INSERT INTO public."Reviews" (movie_id, account_id, description, title, rating)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, movie_id, account_id, title, description, rating;
  `
  const { rows } = await pool.query(sql, [movieId, accountId, description, title, rating])
  return rows[0]
}

export async function listReviewsByMovie(movieId, limit = 50, offset = 0) {
  const sql = `
    SELECT
      r.id,
      r.account_id,
      r.movie_id,
      r.title,
      r.description,
      r.rating,
      r.created_at,
      a.email AS author_email
    FROM public."Reviews" r
    JOIN public."Account" a ON a.id = r.account_id
    WHERE r.movie_id = $1
    ORDER BY r.id DESC
    LIMIT $2 OFFSET $3;
  `;
  const { rows } = await pool.query(sql, [movieId, limit, offset]);
  return rows;
}
