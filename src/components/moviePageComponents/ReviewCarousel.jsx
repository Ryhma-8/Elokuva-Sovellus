import { useEffect, useState } from "react";
import "../../css/reviewCarousel.css";
import { getReviews } from "../../services/reviews";

function ReviewCarousel({ movieId, movieTitle, refreshTick = 0 }) {
  const [reviews, setReviews] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const rows = await getReviews(movieId);
        if (!on) return;
        setReviews(rows || []);
        setIndex(0);
      } catch (e) {
        setErr(e?.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [movieId, refreshTick]);

  const has = reviews.length > 0;
  const review = has ? reviews[index] : null;

  const prevReview = () => {
    setIndex((prev) => (prev === 0 ? Math.max(reviews.length - 1, 0) : prev - 1));
  };

  const nextReview = () => {
    setIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="review-carousel">
      <h2 className="review-h2">Latest reviews</h2>

      {loading && <p>Loading…</p>}
      {err && <p className="text-red-500">{err}</p>}
      {!loading && !has && <p id="no-reviews">No reviews yet.</p>}

      {has && review && (
        <div className="review-content">
          <button className="nav-btn" onClick={prevReview}>
            {"<"}
          </button>

          <div className="review-card">
            <p className="review-text">"{review.description}"</p>
            <p className="review-rating">{review.rating ?? "-"} / 5</p>

            {/* Elokuvan nimi (välitetty MoviePagesta propina) */}
            {movieTitle && <p className="review-movie">{movieTitle}</p>}

            {/* Kirjoittajan sähköposti (tulee backendin JOINista) */}
            <div className="review-user">
              <div>
                <p>{review.author_email}</p>

              </div>
              <div className="review-timestamp">
              <div>
              <p>
                {new Date(review.created_at).toLocaleString('fi-FI', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              </div>
              </div>
            </div>
          </div>

          <button className="nav-btn" onClick={nextReview}>
            {">"}
          </button>
        </div>
      )}
    </div>
  );
}

export default ReviewCarousel;
