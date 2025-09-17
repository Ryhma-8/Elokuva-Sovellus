import { useEffect, useState } from "react";
import MovieList from "./MovieList.jsx";
import { getAreas, getSchedule, formatFinnkinoDate } from "../services/finnkino.js";
import "../css/ShowtimesPage.css";

export default function TheatreShowtimesSection({
  title = "Next movie presentations",
  showTheatrePicker = true,
  showDatePicker = true,
  initialCount = 8,
  step = initialCount,
  showMore = true,
  defaultAreaId,
  defaultDate = formatFinnkinoDate(new Date()),
}) {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(defaultAreaId ?? "");
  const [date, setDate] = useState(defaultDate);

  const [shows, setShows] = useState([]);
  const [status, setStatus] = useState("idle"); // idle|loading|ready|empty|error
  const [errorMsg, setErrorMsg] = useState("");

  // Alueet
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const list = await getAreas();
        if (ignore) return;
        setAreas(list);
        if (!defaultAreaId) setSelectedArea(list[0]?.id ?? "");
      } catch (e) {
        if (!ignore) console.error("Retrieving areas failed:", e);
      }
    })();
    return () => { ignore = true; };
  }, [defaultAreaId]);

  // Näytökset
  useEffect(() => {
    if (!selectedArea || !date) return;
    let ignore = false;

    (async () => {
      setStatus("loading");
      setErrorMsg("");
      try {
        const data = await getSchedule({ area: selectedArea, date });
        if (ignore) return;
        setShows(data);
        setStatus(data.length ? "ready" : "empty");
      } catch (e) {
        if (ignore) return;
        console.error("Schedule retrieval failed:", e);
        setErrorMsg("Schedule retrieval failed. Try a different day.");
        setStatus("error");
      }
    })();

    return () => { ignore = true; };
  }, [selectedArea, date]);

  return (
    <div className="showtimes-container" style={{ marginTop: "3rem" }}>
      <h2 className="showtimes-header">{title}</h2>

      <div className="showtimes-filters">
        {showTheatrePicker && (
          <label>
            Theatre
            <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>
        )}

        {showDatePicker && (
          <label>
            Date (dd.mm.yyyy)
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="dd.mm.yyyy"
              pattern="\d{2}\.\d{2}\.\d{4}"
              title="Muoto dd.mm.yyyy"
            />
          </label>
        )}
      </div>

      {status === "loading" && <p> Loading showtimes…</p>}
      {status === "error" && <p role="alert"> {errorMsg}</p>}
      {status === "empty" && <p> No showtimes for the selected date.</p>}

      {status === "ready" && (
        <MovieList
          shows={shows}
          selectedDate={date}
          initialCount={initialCount}
          step={step}
          showMore={showMore}
        />
      )}
    </div>
  );
}
