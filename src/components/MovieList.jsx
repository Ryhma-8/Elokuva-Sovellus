import { useMemo, useState } from "react";
import MovieCard from "./MovieCard.jsx";
import { formatFinnkinoDate } from "../services/finnkino.js";

function isSameFinnkinoDay(dateStr) {
  return dateStr === formatFinnkinoDate(new Date());
}

export default function MovieList({ shows, selectedDate, initialCount = 8 }) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const todaySelected = isSameFinnkinoDay(selectedDate);
  const now = new Date();

  // Ryhmittely ja rajaus 4 seuraavaa aikaa / kortti
  const cards = useMemo(() => {
    const map = new Map();
    for (const s of shows) {
      const key = `${s.title}|${s.image ?? ""}`;
      if (!map.has(key)) map.set(key, { title: s.title, image: s.image, times: [] });
      map.get(key).times.push(s.start);
    }

    const list = Array.from(map.values()).map((m) => {
      const ordered = m.times.sort((a, b) => new Date(a) - new Date(b));
      const filtered = todaySelected ? ordered.filter((t) => new Date(t) >= now) : ordered;
      return { ...m, times: filtered.slice(0, 4) };
    });

    // poista tyhjät ja järjestä aikaisimman esitysajan mukaan
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
          <MovieCard key={`${m.title}-${idx}`} title={m.title} image={m.image} times={m.times} />
        ))}
      </div>

      {canLoadMore && (
        <div className="load-more">
          <button onClick={() => setVisibleCount((v) => v + initialCount)}>Show more</button>
        </div>
      )}
    </>
  );
}
