import { useMemo, useState } from "react";
import MovieCard from "./MovieCard.jsx";
import { formatFinnkinoDate } from "../services/finnkino.js";

function isSameFinnkinoDay(dateStr) {
  return dateStr === formatFinnkinoDate(new Date());
}

export default function MovieList({
  shows,
  selectedDate,
  initialCount = 8,
  step = initialCount,
  showMore = true,
}) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const todaySelected = isSameFinnkinoDay(selectedDate);
  const now = new Date();

  // Ryhmitellään elokuvittain ja pidetään jokaisesta ajasta tallessa myös showtime-id + theatre/auditorium
  const cards = useMemo(() => {
    const byMovie = new Map();

    for (const s of shows) {
      const key = `${s.title}|${s.image ?? ""}`;
      if (!byMovie.has(key)) {
        byMovie.set(key, { title: s.title, image: s.image, items: [] });
      }
      byMovie.get(key).items.push({
        id: s.id,
        start: s.start,
        theatre: s.theatre ?? null,
        auditorium: s.auditorium ?? null,
      });
    }

    const list = Array.from(byMovie.values()).map((m) => {
      const ordered = m.items.slice().sort((a, b) => new Date(a.start) - new Date(b.start));
      const filtered = todaySelected ? ordered.filter((t) => new Date(t.start) >= now) : ordered;
      const limited = filtered.slice(0, 4);

      // Takautuvuus: vanha times:string[] vielä mukana
      const timesAsStrings = limited.map((t) => t.start);

      return {
        title: m.title,
        image: m.image,
        showItems: limited,   // { id, start, theatre, auditorium }
        times: timesAsStrings
      };
    });

    const nonEmpty = list.filter((m) => m.times.length > 0);
    nonEmpty.sort((a, b) => new Date(a.times[0]) - new Date(b.times[0]));
    return nonEmpty;
  }, [shows, selectedDate]);

  const visible = cards.slice(0, visibleCount);
  const canLoadMore = visibleCount < cards.length;

  if (!cards.length) return null;

  return (
    <>
      <div className="showtimes-grid">
        {visible.map((m, idx) => (
          <MovieCard
            key={`${m.title}-${idx}`}
            title={m.title}
            image={m.image}
            times={m.times}
            showItems={m.showItems}
          />
        ))}
      </div>

      {showMore && canLoadMore && (
        <div className="load-more">
          <button onClick={() => setVisibleCount((v) => v + step)}>Show more</button>
        </div>
      )}
    </>
  );
}
