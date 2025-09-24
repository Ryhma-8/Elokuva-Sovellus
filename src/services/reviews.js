import {refreshAccessToken} from "../services/refreshToken.js"

const BASE = import.meta.env.VITE_API_URL; 

async function handle(r) {
  let data = null;
  try { data = await r.json(); } catch {}
  if (!r.ok) {
    const msg =
      data?.err?.message ||
      data?.error?.message ||
      r.statusText ||
      'Request failed';
    const e = new Error(msg);
    e.status = r.status;
    e.data = data;
    throw e;
  }
  return data;
}


export async function getReviews(movieId) {
  const url = `${BASE}/api/reviews?movie_id=${encodeURIComponent(movieId)}`;
  const r = await fetch(url);
  return handle(r); // -> { id, account_id, movie_id, title, description, rating }
}


//Tässä uudella tokenilla tehdyn kutsun voisi toteuttaa paremmin, esim axiosilla on oma intercepter ominaisuus tätä varten 
export async function addReview({ movie_id, description, rating, title = '' }) {
  const user = JSON.parse(sessionStorage.getItem('user'))
  const r = await fetch(`${BASE}/api/reviews`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ movie_id, description, rating, title }),
  });
  if (r.status===401) {
    await refreshAccessToken()
    const user = JSON.parse(sessionStorage.getItem('user'))
    const newR = await fetch(`${BASE}/api/reviews`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ movie_id, description, rating, title }),
    });
    return handle(newR);
  }
  return handle(r);
}
