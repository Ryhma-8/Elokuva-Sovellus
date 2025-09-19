import { useState } from "react";
import "../../css/reviewCarousel.css";

const testReviews = [
  {
    id: 1,
    text: "This movie was horrible",
    rating: 1,
    movie: "The Lord of the Rings: The Return of the King",
    user: "user@example.com",
    date: "14.09.2025 14:52",
  },
  {
    id: 2,
    text: "Amazing movie. I really enjoy JRR Tolkien's work",
    rating: 5,
    movie: "The Lord of the Rings: The Return of the King",
    user: "user@example.com",
    date: "14.09.2025 15:00",
  },
  {
    id: 3,
    text: "I truly like Gandalf, but I think that Frodo Baggins is simply a shitty character. Eventhough I didn't like Frodo, the movie was epic. Halfway through the movie I was astonished by Saruman and I would have liked for him to be more in the movie. Cool!",
    rating: 4,
    movie: "The Lord of the Rings: The Return of the King",
    user: "user@example.com",
    date: "15.09.2025 10:15",
  },
];

function ReviewCarousel() {
  const [index, setIndex] = useState(0);

  const prevReview = () => {
    setIndex((prev) => (prev === 0 ? testReviews.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setIndex((prev) => (prev === testReviews.length - 1 ? 0 : prev + 1));
  };

  const review = testReviews[index];

  return (
    <div className="review-carousel">
        <h2 className="review-h2">Latest reviews</h2>

        <div className="review-content">
      <button className="nav-btn" onClick={prevReview}>{"<"}</button>
      <div className="review-card">
        <p className="review-text">"{review.text}"</p>
        <p className="review-rating">{review.rating}/5</p>
        <p className="review-movie">{review.movie}</p>
        <div className="review-user">
          <div>
            <p>{review.user}</p>
            <p>{review.date}</p>
          </div>
        </div>
      </div>
      <button className="nav-btn" onClick={nextReview}>{">"}</button>
    </div>
    </div>
  );
}

export default ReviewCarousel;
