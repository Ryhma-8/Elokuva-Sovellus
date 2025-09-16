import React, { useState } from "react";
import "../css/leaveReview.css";

export default function LeaveReview() {
    const [reviewText, setReviewText] = useState("");
    const [starRating, setStarRating] = useState(0);
    const maxLength = 250;

    const handleLength = (e) => {
        if (e.target.value.length <= maxLength) {
            setReviewText(e.target.value);
        }
        };

        const handleSubmit = async (e) => {
            e.preventDefault();

       const res = await fetch("", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reviewText, starRating }),
          });
      
          if (res.ok) {
            alert("Review sent successfully");
            setReviewText("");
            setStarRating(0);
          } else {
            alert(`Error sending review:\n Review: "${reviewText}"\nStars: "${starRating}"`); // Temporary alert to show review data
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
        
                <button type="submit" className="review-submit-btn">Send</button>
              </form>
            </div>
          );
        }
