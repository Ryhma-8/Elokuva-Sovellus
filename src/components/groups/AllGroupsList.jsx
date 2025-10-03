import { useEffect, useMemo, useState } from "react";
import { getAllGroups, getMyGroups, sendJoinRequest } from "../../services/groups.js";
import Alert from "../Alert.jsx";

// parsi jäsenmäärä riviltä (COUNT tulee usein tekstinä "0")
function parseCount(row) {
  if (row == null) return 0;

  const raw = row.count ?? row.member_count ?? row.members ?? 0;
  const n = Number(raw);
  return isNaN(n) ? 0 : n;
}

export default function AllGroupsList({ disabled }) {
  // tilat
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [allRows, setAllRows] = useState([]); // { id, name, count }
  const [myMap, setMyMap] = useState(new Map()); // group_id -> user_role
  const [sending, setSending] = useState(new Set()); // rivikohtainen spinner

  // Nouto: kaikki + omat
  useEffect(() => {
    const run = async () => {
      setError("");
      setInfo("");
      setLoading(true);
      try {
        const [all, mine] = await Promise.all([
          getAllGroups(),
          getMyGroups().catch(() => []), 
        ]);

        setAllRows(Array.isArray(all) ? all : []);
        // owner/member/invited/join_requested
        const m = new Map();
        if (Array.isArray(mine)) {
          for (const g of mine) {
            m.set(g.group_id, g.user_role);
          }
        }
        setMyMap(m);
      } catch (e) {
        setError(e?.message || "Failed to load groups");
      } finally {
        setLoading(false);
      }
    };

    if (!disabled) run();
    else {
      setAllRows([]);
      setMyMap(new Map());
      setError("");
      setInfo("");
    }
  }, [disabled]);

  // Suodatetaan: näytä ryhmät joissa EN ole owner/member
  const visibleRows = useMemo(() => {
    return allRows.filter((r) => {
      const role = myMap.get(r.id);
      return role !== "owner" && role !== "member";
    });
  }, [allRows, myMap]);

  // Klikkaus: lähetä join request
  const onJoin = async (row) => {
    setError("");
    setInfo("");
    const id = row.id;
    // jos jo pending/invited → ei tehdä mitään
    const role = myMap.get(id);
    if (role === "join_requested" || role === "invited") return;

    setSending((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      await sendJoinRequest(id);
      setInfo("Join request sent.");
      // Merkitse tähän riviin pending-tila
      setMyMap((prev) => {
        const next = new Map(prev);
        next.set(id, "join_requested");
        return next;
      });
    } catch (e) {
      setError(e?.message || "Failed to send join request");
    } finally {
      setSending((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="fw-semibold">All groups</div>
        {loading && (
          <div className="d-inline-flex align-items-center gap-2 small text-dark">
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            />
            Loading…
          </div>
        )}
      </div>

      {info && <Alert type="success">{info}</Alert>}
      {error && <Alert type="danger">{error}</Alert>}

      {disabled ? (
        <p className="empty-state mb-3">No groups found.</p>
      ) : !visibleRows.length && !loading ? (
        <p className="empty-state mb-3">No groups found.</p>
      ) : (
        visibleRows.map((r) => {
          const cnt = parseCount(r);
          const role = myMap.get(r.id); // undefined | invited | join_requested
          const busy = sending.has(r.id);

          // Napin teksti/tila
          let label = "Send a joining request";
          let disabledBtn = false;
          if (role === "join_requested") {
            label = "Pending";
            disabledBtn = true;
          } else if (role === "invited") {
            label = "Invited";
            disabledBtn = true;
          }

          return (
            <div key={r.id} className="group-row">
              <div className="d-flex flex-column">
                <span className="fw-semibold">{r.name}</span>
                <small className="text-muted">Member count: {cnt}</small>
              </div>
              <button
                className="btn btn-sm btn-outline-primary"
                disabled={disabledBtn || busy}
                onClick={() => onJoin(r)}
              >
                {busy ? (
                  <span className="d-inline-flex align-items-center gap-2">
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />
                    Sending…
                  </span>
                ) : (
                  label
                )}
              </button>
            </div>
          );
        })
      )}
    </>
  );
}
