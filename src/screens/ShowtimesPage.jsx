import { useEffect, useState } from "react";
import "../css/ShowtimesPage.css";
import MovieList from "../components/MovieList.jsx";
import { getAreas, getSchedule, formatFinnkinoDate } from "../services/finnkino.js";

export default function ShowtimesPage() {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [date, setDate] = useState(formatFinnkinoDate()); // oletus = tänään

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
        setSelectedArea(list[0]?.id ?? "");
      } catch (e) {
        if (!ignore) console.error("Retrieving areas failed:", e);
      }
    })();
    return () => { ignore = true; };
  }, []);

  // Näytösajat
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
    <div className="showtimes-container">
      <h2 className="showtimes-header">Movies presenting in Finnkino</h2>

      <div className="showtimes-filters">
        <label>
          Theater
          <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </label>

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
      </div>

      {status === "loading" && <p> Loading showtimes…</p>}
      {status === "error" && <p role="alert"> {errorMsg}</p>}
      {status === "empty" && <p> No showtimes for the selected date.</p>}

      {status === "ready" && (
        <MovieList shows={shows} selectedDate={date} initialCount={8} />
      )}
    </div>
  );
}
