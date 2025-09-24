import React, { useState } from "react";
import "../../css/leaveReview.css";
import { addReview } from "../../services/reviews";

export default function LeaveReview({ movieId, onReviewSent }) {
  const [reviewText, setReviewText] = useState("");
  const [starRating, setStarRating] = useState(0);
  const [sending, setSending] = useState(false);
  const maxLength = 250;

  const handleLength = (e) => {
    if (e.target.value.length <= maxLength) {
      setReviewText(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const description = reviewText.trim();
    if (description.length < 1) {
      alert("Write something (1–250 chars).");
      return;
    }
    try {
      setSending(true);
      await addReview({
        movie_id: movieId,
        description,
        title: "", // käytännössä turha kentä, voi poistaa täältä ja kannasta
        rating: starRating || null, // valinnainen
      });
      setReviewText("");
      setStarRating(0);
      onReviewSent?.(); // päivityssignaali karusellille
    } catch (err) {
      alert(err?.message || "Failed to send review");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="leave-review">
      <h2 className="review-h2">Leave a review</h2>
      <form className="review-form" onSubmit={handleSubmit}>
        <div className="textarea-wrapper">
          <textarea
            className="review-textarea"
            value={reviewText}
            onChange={handleLength}
            maxLength={maxLength}
            placeholder="Write your thoughts…"
          />

          <div className="star-rating">
            {[5,4,3,2,1].map(star => (
              <React.Fragment key={star}>
                <input
                  className="radio-input"
                  type="radio"
                  id={`star${star}`}
                  name="star-input"
                  value={star}
                  checked={starRating === star}
                  onChange={() => setStarRating(star)}
                />
                <label className="radio-label" htmlFor={`star${star}`} title={`${star} stars`}></label>
              </React.Fragment>
            ))}
          </div>

          <div className="char-counter">{reviewText.length}/{maxLength}</div>
        </div>

        <button type="submit" className="review-submit-btn" disabled={sending}>
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
