import { useEffect, useState } from "react";
import { getMyGroups } from "../../services/groups.js";
import Alert from "../Alert.jsx";
import { Link } from "react-router-dom";

// apuri: roolin badge-luokka
function roleBadge(role) {
  switch (role) {
    case "owner":
      return "text-bg-primary";
    case "member":
      return "text-bg-secondary";
    case "invited":
      return "text-bg-warning";
    case "join_requested":
      return "text-bg-info";
    default:
      return "text-bg-light";
  }
}

// apuri: member-statuksen badge-luokka
function memberBadge(status) {
  switch (status) {
    case "joined":
      return "text-bg-success";
    case "invited":
      return "text-bg-warning";
    default:
      return "text-bg-light";
  }
}

export default function MyGroupsList({ disabled }) {
  // tilat
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]); // {group_id, group_name, user_role, members[]}
  const [error, setError] = useState("");

  // nouto
  useEffect(() => {
    const run = async () => {
      setError("");
      setLoading(true);
      try {
        const data = await getMyGroups();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || "Failed to load groups");
      } finally {
        setLoading(false);
      }
    };
    if (!disabled) run();
    else {
      setRows([]);
      setError("");
    }
  }, [disabled]);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="fw-semibold">My groups</div>
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

      {error && <Alert type="danger">{error}</Alert>}

      {disabled ? (
        <p className="empty-state mb-3">No groups yet.</p>
      ) : !rows.length && !loading ? (
        <p className="empty-state mb-3">No groups yet.</p>
      ) : (
        rows.map((g) => {
          const memberCount = Array.isArray(g.members) ? g.members.length : 0;
          return (
            <div key={g.group_id} className="group-row">
              <div className="d-flex flex-column">
                <span className="fw-semibold d-flex align-items-center gap-2">
                  {g.group_name}
                  <span className={`badge rounded-pill ${roleBadge(g.user_role)}`}>
                    {g.user_role}
                  </span>
                </span>
                <small className="text-muted">Members: {memberCount}</small>
              </div>

              <div className="d-flex align-items-center gap-2">
                {/* Members-dropdown (read-only) */}
                <select className="form-select form-select-sm member-select">
                  <option>Members</option>
                  {(g.members || []).map((m, idx) => (
                    <option key={idx} value={m.username}>
                      {m.username} — {m.status}
                    </option>
                  ))}
                </select>

                {/* Toiminnot – toistaiseksi disabloitu */}
                {g.user_role === "owner" ? (
                  <button className="btn btn-sm btn-outline-danger" disabled>
                    Delete group
                  </button>
                ) : (
                  <button className="btn btn-sm btn-outline-secondary" disabled>
                    Leave group
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
