import { useState } from "react";
import "../css/leaveReview.css";

export default function LeaveReview() {
    const [reviewText, setReviewText] = useState("");
    const [starRating, setStarRating] = useState(0);
    const maxLength = 250;

    const handleLength = (e) => {
        if (e.target.value.length <= maxLength) {
            setReviewText(e.target.value);
        }
        }

  return (
    <div className="leave-review">
      <h2 className="review-h2">Leave a review</h2>
      <form className="review-form">
        <div className="textarea-wrapper">
          <textarea
            className="review-textarea"
            placeholder="Write your review here..."
            value={reviewText}
            onChange={handleLength}
            maxLength={maxLength}
          ></textarea>

          <div className="star-rating">
            <input className="radio-input" type="radio" id="star5" name="star-input" value="5" />
            <label className="radio-label" htmlFor="star5" title="5 stars"></label>

            <input className="radio-input" type="radio" id="star4" name="star-input" value="4" />
            <label className="radio-label" htmlFor="star4" title="4 stars"></label>

            <input className="radio-input" type="radio" id="star3" name="star-input" value="3" />
            <label className="radio-label" htmlFor="star3" title="3 stars"></label>

            <input className="radio-input" type="radio" id="star2" name="star-input" value="2" />
            <label className="radio-label" htmlFor="star2" title="2 stars"></label>

            <input className="radio-input" type="radio" id="star1" name="star-input" value="1" />
            <label className="radio-label" htmlFor="star1" title="1 star"></label>
          </div>

        <div className="char-counter">
            <p>{reviewText.length}/{maxLength}</p>
        </div>
        </div>

        <button type="submit" className="review-submit-btn">Send</button>
      </form>
    </div>
  );
}
