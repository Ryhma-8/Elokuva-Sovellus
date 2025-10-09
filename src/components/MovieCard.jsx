import { useEffect, useMemo, useRef, useState } from "react";
import GroupSelect from "./GroupSelect.jsx";
import { addShowTimeToGroup } from "../services/groups.js";

/**
 * Kortti yhdelle elokuvalle.
 * - Listaa 1–4 seuraavaa näytöstä
 * - Jokaisella rivillä Add-nappi, joka lisää valitun näytöksen ryhmään
 * - Snapshotiin lähetetään start, title, image sekä theatre ja auditorium (jos tiedossa)
 * - Palaute näkyy pienenä “toastina” ja katoaa automaattisesti
 */
export default function MovieCard({ title, image, times = [], showItems }) {
  // Valittu ryhmä (dropdown)
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // Yhden rivin “kiireinen”-tila
  const [busyShowId, setBusyShowId] = useState(null);

  // Korttikohtainen palaute (automaattisesti katoava)
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'info'|'error', text }
  const toastTimerRef = useRef(null);

  // Hetkellinen “added”-tila napille (näytetään ✓ Added hetken)
  const [justAdded, setJustAdded] = useState(new Set());

  // Nopein kirjautumistsekki: token sessiossa
  const isSignedIn = useMemo(() => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      return Boolean(user?.accessToken);
    } catch {
      return false;
    }
  }, []);

  // Normalisoidaan: halutaan aina { id, start, theatre?, auditorium? }
  const rows = useMemo(() => {
    if (Array.isArray(showItems) && showItems.length) {
      return showItems.map((it) => ({
        id: it?.id ?? null,
        start: it?.start ?? "",
        theatre: it?.theatre ?? null,
        auditorium: it?.auditorium ?? null,
      }));
    }
    // Takautuva tuki: jos tuli vain times:string[], ei ole id/teatteri/sali -tietoa
    return (times || []).map((t) => ({ id: null, start: t, theatre: null, auditorium: null }));
  }, [showItems, times]);

  // Pieni apuri muotoiluun
  const formatDateTime = (iso) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString("fi-FI", { day: "2-digit", month: "2-digit", year: "numeric" });
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
  };

  // Palaute katoaa automaattisesti
  useEffect(() => {
    if (!feedback) return;
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setFeedback(null), 1500);
    return () => clearTimeout(toastTimerRef.current);
  }, [feedback]);

  const onAdd = async (item) => {
    setFeedback(null);

    const numericId = Number(item?.id);
    const canUseId = Number.isFinite(numericId);
    if (!selectedGroupId || !isSignedIn || !canUseId) return;

    try {
      setBusyShowId(item.id);

      // Snapshot: lisätään theatre ja auditorium mukaan, jotta GroupPage voi näyttää ne
      const body = {
        groupId: Number(selectedGroupId),
        showTimeId: numericId,
        start: item.start || undefined,
        title: title || undefined,
        theatre: item.theatre || undefined,
        auditorium: item.auditorium || undefined,
        image: image || undefined,
      };

      const res = await addShowTimeToGroup(body);

      if (res.ok) {
        // näytä pikku “added”-tila napille
        setJustAdded((prev) => {
          const next = new Set(prev);
          next.add(item.id);
          return next;
        });
        setTimeout(() => {
          setJustAdded((prev) => {
            const next = new Set(prev);
            next.delete(item.id);
            return next;
          });
        }, 1200);

        setFeedback({ type: "success", text: "Added to group." });
      } else if (res.info && res.status === 400) {
        setFeedback({ type: "info", text: "Show time already in this group." });
      } else {
        setFeedback({ type: "error", text: res.message || "Adding failed." });
      }
    } catch (e) {
      setFeedback({ type: "error", text: e?.message || "Adding failed." });
    } finally {
      setBusyShowId(null);
    }
  };

  const isAddDisabled = (item) => {
    const numericId = Number(item?.id);
    const canUseId = Number.isFinite(numericId);
    return !selectedGroupId || !isSignedIn || !canUseId || busyShowId === item.id;
  };

  return (
    <article className="show-card">
      <div className="show-card-image">
        {image ? <img src={image} alt="" /> : <div style={{ opacity: 0.6 }}>No image</div>}
      </div>

      <div className="show-card-body position-relative">{/* suhteellinen, jotta toastin saa kiinni */}
        <div className="show-card-title">{title}</div>

        {/* Näytösaikojen lista + Add-nappi per rivi */}
        <div className="show-card-times">
          {rows.map((it, idx) => {
            const hasNumericId = Number.isFinite(Number(it.id));
            const isBusy = busyShowId === it.id;
            const wasJustAdded = justAdded.has(it.id);

            return (
              <div key={`${it.start}-${idx}`} className="d-flex align-items-center gap-2">
                <div className="flex-grow-1">
                  {formatDateTime(it.start)}
                </div>

                <button
                  className={`btn btn-sm rounded-pill px-3 ${
                    wasJustAdded ? "btn-success disabled" : "btn-outline-primary"
                  }`}
                  onClick={() => onAdd(it)}
                  disabled={isAddDisabled(it) || wasJustAdded}
                  aria-label={`Add ${formatDateTime(it.start)} to group`}
                  title={
                    !hasNumericId
                      ? "Unavailable for adding"
                      : wasJustAdded
                      ? "Added"
                      : "Add this showtime to group"
                  }
                >
                  {wasJustAdded ? (
                    "✓ Added"
                  ) : isBusy ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Adding…
                    </>
                  ) : (
                    "Add"
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Ryhmän valinta */}
        <div className="card-actions mt-3">
          <label className="card-label d-block mb-1">Add for group:</label>
          <div className="d-flex align-items-center gap-2">
            <GroupSelect
              value={selectedGroupId}
              onChange={setSelectedGroupId}
              placeholder={isSignedIn ? "Groups" : "Sign in to add"}
              disabled={!isSignedIn}
            />
          </div>
        </div>

        {/* Pieni kelluva toast, katoaa itsestään */}
        {feedback && (
          <div
            className={`inline-toast alert ${
              feedback.type === "success"
                ? "alert-success"
                : feedback.type === "info"
                ? "alert-info"
                : "alert-danger"
            } py-1 px-2 m-0`}
            role="status"
            aria-live="polite"
          >
            {feedback.text}
          </div>
        )}
      </div>
    </article>
  );
}
