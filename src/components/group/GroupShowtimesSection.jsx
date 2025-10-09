import { useEffect, useMemo, useState } from "react";
import { getGroupShowTimes, deleteGroupShowTime } from "../../services/groups.js";


export default function GroupShowtimesSection({ groupId }) {
  const [status, setStatus] = useState("idle"); // idle | loading | ready | empty | error
  const [errorMsg, setErrorMsg] = useState("");
  const [allItems, setAllItems] = useState([]);
  const [tab, setTab] = useState("upcoming"); // upcoming | past
  const [busy, setBusy] = useState(new Set()); // poistossa käytetään

  // Haku mountissa ja kun groupId vaihtuu
  useEffect(() => {
    if (!groupId) return;
    let cancelled = false;

    (async () => {
      setStatus("loading");
      setErrorMsg("");
      try {
        const data = await getGroupShowTimes(groupId);
        const rows = Array.isArray(data?.result) ? data.result : [];

        if (cancelled) return;
        if (!rows.length) {
          setAllItems([]);
          setStatus("empty");
          return;
        }

        // Pieni siistiminen: varmistetaan kenttien olemassaolo
        const normalized = rows.map((r) => ({
          showTimeId: Number(r.presenting_times_id),
          start: r.start || null,
          title: r.title || "",
          theatre: r.theatre || null,
          auditorium: r.auditorium || null,
          image: r.image || null,
          created_at: r.created_at || null,
        }));

        setAllItems(normalized);
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setErrorMsg(e?.message || "Failed to load group showtimes.");
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [groupId]);

  // Suodatus ja järjestys välilehden mukaan
  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const isPast = (it) => (it.start ? new Date(it.start) < now : true); // jos start puuttuu, laitetaan pastiin
    const isUpcoming = (it) => it.start && new Date(it.start) >= now;

    const ups = allItems.filter(isUpcoming).sort((a, b) => new Date(a.start) - new Date(b.start));
    const pas = allItems.filter(isPast).sort((a, b) => {
      const aa = a.start ? new Date(a.start).getTime() : 0;
      const bb = b.start ? new Date(b.start).getTime() : 0;
      return bb - aa; // menneet uusimmat ensin
    });

    return { upcoming: ups, past: pas };
  }, [allItems]);

  const shown = tab === "upcoming" ? upcoming : past;

  // Poisto yhdelle riville
  const onRemove = async (it) => {
    if (!groupId || !it?.showTimeId) return;
    setErrorMsg("");
    setBusy((prev) => new Set(prev).add(it.showTimeId));
    try {
      await deleteGroupShowTime({ groupId: Number(groupId), showTimeId: Number(it.showTimeId) });
      // Optimistinen päivitys
      setAllItems((prev) => prev.filter((x) => x.showTimeId !== it.showTimeId));
    } catch (e) {
      setErrorMsg(e?.message || "Removal failed.");
    } finally {
      setBusy((prev) => {
        const next = new Set(prev);
        next.delete(it.showTimeId);
        return next;
      });
    }
  };

  const fmt = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    const date = d.toLocaleDateString("fi-FI", { day: "2-digit", month: "2-digit", year: "numeric" });
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
  };

  return (
    <div className="container my-4">
      <div className="card border-2">
        <div className="card-header fw-semibold d-flex align-items-center justify-content-between">
          <span>Group showtimes</span>

          {/* Välilehdet */}
          <div className="btn-group" role="group" aria-label="Showtimes tabs">
            <button
              type="button"
              className={`btn btn-sm ${tab === "upcoming" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setTab("upcoming")}
            >
              Upcoming
            </button>
            <button
              type="button"
              className={`btn btn-sm ${tab === "past" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setTab("past")}
            >
              Past
            </button>
          </div>
        </div>

        <div className="card-body">
          {status === "loading" && <p className="text-muted m-0">Loading showtimes…</p>}
          {status === "error" && <div className="alert alert-danger m-0">{errorMsg}</div>}

          {status === "empty" && (
            <p className="text-muted m-0">
              {tab === "upcoming" ? "No upcoming showtimes for this group." : "No past showtimes."}
            </p>
          )}

          {status === "ready" && shown.length === 0 && (
            <p className="text-muted m-0">
              {tab === "upcoming" ? "No upcoming showtimes for this group." : "No past showtimes."}
            </p>
          )}

          {status === "ready" && shown.length > 0 && (
            <div role="list" className="d-flex flex-column gap-2">
              {shown.map((it) => (
                <div
                  key={`${it.showTimeId}-${it.start || "nostart"}`}
                  role="listitem"
                  className="d-flex align-items-center gap-3 p-2 border rounded"
                >
                  {/* Kuva vasemmalle */}
                  <div style={{ width: 56, height: 80, flex: "0 0 auto", background: "#f7f7f7" }} className="d-flex align-items-center justify-content-center overflow-hidden rounded">
                    {it.image ? (
                      <img src={it.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span className="text-muted small">No image</span>
                    )}
                  </div>

                  {/* Tekstit keskelle */}
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{it.title || "—"}</div>
                    <div className="text-muted small">
                      {it.theatre || "—"}
                      {it.auditorium ? ` · ${it.auditorium}` : ""}
                    </div>
                    <div className="small">{fmt(it.start)}</div>
                  </div>

                  {/* Poisto oikealle */}
                  <div className="d-flex align-items-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      disabled={busy.has(it.showTimeId)}
                      onClick={() => onRemove(it)}
                      aria-label={`Remove ${it.title || "showtime"} ${fmt(it.start)} from group`}
                      title="Remove from group"
                    >
                      {busy.has(it.showTimeId) ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Yleinen palaute kortin alaosaan, jos on */}
        {errorMsg && status !== "error" && (
          <div className="card-footer">
            <div className="alert alert-warning m-0" role="status" aria-live="polite">
              {errorMsg}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
