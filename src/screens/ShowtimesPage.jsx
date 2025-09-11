import { useEffect, useMemo, useState } from "react";
import "../css/ShowtimesPage.css";

function formatFinnkinoDate(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function isSameFinnkinoDay(dateStr) {
  return dateStr === formatFinnkinoDate(new Date());
}

// Muunna Schedule-XML -> taulukko
function parseSchedule(xml) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const showNodes = [...doc.getElementsByTagName("Show")];

  const shows = showNodes.map((n) => ({
    id:
      n.getElementsByTagName("ID")[0]?.textContent?.trim() ??
      n.getElementsByTagName("dttmShowStart")[0]?.textContent?.trim() ??
      Math.random().toString(36).slice(2),
    title: n.getElementsByTagName("Title")[0]?.textContent ?? "",
    theatre: n.getElementsByTagName("Theatre")[0]?.textContent ?? "",
    auditorium:
      n.getElementsByTagName("TheatreAuditorium")[0]?.textContent ?? null,
    start: n.getElementsByTagName("dttmShowStart")[0]?.textContent ?? "",
    image:
      n.getElementsByTagName("EventSmallImagePortrait")[0]?.textContent ??
      null,
  }));

  // nouseva aikajärjestys
  shows.sort((a, b) => new Date(a.start) - new Date(b.start));
  return shows;
}

// Ryhmittää esitykset elokuvan mukaan (Title + image) näkyy 4 seuraavaa aikaa
function groupByMovie(shows, selectedDate) {
  const map = new Map();
  for (const s of shows) {
    const key = `${s.title}|${s.image ?? ""}`;
    if (!map.has(key)) {
      map.set(key, { title: s.title, image: s.image, times: [] });
    }
    map.get(key).times.push(s.start);
  }

  const now = new Date();
  const todaySelected = isSameFinnkinoDay(selectedDate);

  const list = Array.from(map.values()).map((m) => {
    const ordered = m.times.sort((a, b) => new Date(a) - new Date(b));
    const filtered = todaySelected ? ordered.filter((t) => new Date(t) >= now) : ordered;
    return { ...m, times: filtered.slice(0, 4) }; // vain 4 seuraavaa
  });

  // Poistaa kortit joilla ei ole yhtään aikaa
  const nonEmpty = list.filter((m) => m.times.length > 0);

  // Järjestää kortit sen elokuvan aikaisimman esitysajan mukaan
  nonEmpty.sort((a, b) => new Date(a.times[0]) - new Date(b.times[0]));
  return nonEmpty;
}

export default function ShowtimesPage() {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [date, setDate] = useState(formatFinnkinoDate()); // oletukseksi laitettu, tänään

  const [shows, setShows] = useState([]);
  const [status, setStatus] = useState("idle"); 
  const [errorMsg, setErrorMsg] = useState("");

  const [visibleCount, setVisibleCount] = useState(8); // Näkyy 4x2 korttia

  // Hakee TheatreAreas
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("https://www.finnkino.fi/xml/TheatreAreas/", {
          headers: { accept: "application/xml" },
        });
        const xml = await res.text();

        const doc = new DOMParser().parseFromString(xml, "application/xml");
        const nodes = [...doc.getElementsByTagName("TheatreArea")];

        const list = nodes
          .map((n) => ({
            id: n.getElementsByTagName("ID")[0]?.textContent?.trim() ?? "",
            name: n.getElementsByTagName("Name")[0]?.textContent?.trim() ?? "",
          }))
          .filter((a) => a.id && a.name && !/valitse/i.test(a.name)); // poista "Valitse alue/teatteri"

        if (ignore) return;
        setAreas(list);
        setSelectedArea(list[0]?.id ?? "");
      } catch (e) {
        if (!ignore) console.error("Alueiden haku epäonnistui:", e);
      }
    })();
    return () => { ignore = true; };
  }, []);

  // Hakee Schedule kun alue tai päivä muuttuu
  useEffect(() => {
    if (!selectedArea || !date) return;
    let ignore = false;

    (async () => {
      setStatus("loading");
      setErrorMsg("");
      setVisibleCount(8); // resetoi “näytä lisää” joka haulla

      try {
        const url = `https://www.finnkino.fi/xml/Schedule/?area=${encodeURIComponent(selectedArea)}&dt=${encodeURIComponent(date)}&nrOfDays=1`;
        const res = await fetch(url, { headers: { accept: "application/xml" } });
        const xml = await res.text();

        if (ignore) return;

        const data = parseSchedule(xml);
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

  // Korttidata elokuvittain (max 4 seuraavaa aikaa kortille)
  const movieCards = useMemo(() => groupByMovie(shows, date), [shows, date]);
  const visibleCards = movieCards.slice(0, visibleCount);
  const canLoadMore = visibleCount < movieCards.length;

  return (
    <div className="showtimes-container">
      <h2 className="showtimes-header">Movies presenting in Finnkino</h2>

      <div className="showtimes-filters">
        {/* Teatteri-dropdown */}
        <label>
          Theater
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </label>

        {/* (dd.mm.yyyy) */}
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

      {/* Tilaviestit */}
      {status === "loading" && <p> Loading showtimes…</p>}
      {status === "error" && <p role="alert"> {errorMsg}</p>}
      {status === "empty" && <p> No showtimes for the selected date.</p>}

      {/* Korttiruudukko */}
      {status === "ready" && (
        <>
          <div className="showtimes-grid">
            {visibleCards.map((m, idx) => (
              <article key={`${m.title}-${idx}`} className="show-card">
                <div className="show-card-image">
                  {m.image ? (
                    <img src={m.image} alt="" />
                  ) : (
                    <div style={{ opacity: 0.6 }}>No image</div>
                  )}
                </div>

                <div className="show-card-body">
                  <div className="show-card-title">{m.title}</div>
                  <div className="show-card-times">
                    {m.times.map((t) => (
                      <div key={t}>
                        {new Date(t).toLocaleDateString("fi-FI", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}{" "}
                        {new Date(t).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {canLoadMore && (
            <div className="load-more">
              <button onClick={() => setVisibleCount((v) => v + 8)}>
                Näytä lisää
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
