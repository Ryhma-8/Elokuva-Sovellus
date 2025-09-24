const BASE = import.meta.env.VITE_API_URL; 

function getToken() {
  try {
    const u = JSON.parse(sessionStorage.getItem('user'));
    return u?.accessToken || '';
  } catch {
    return '';
  }
}

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
  const r = await fetch(url); // julkinen 
  return handle(r); // -> { id, account_id, movie_id, title, description, rating }
}

export async function addReview({ movie_id, description, rating, title = '' }) {
  const r = await fetch(`${BASE}/api/reviews`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ movie_id, description, rating, title }),
  });
  return handle(r);
}
