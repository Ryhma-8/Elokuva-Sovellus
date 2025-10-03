import { useEffect, useMemo, useState } from "react";
import { getInvitations, acceptInvitation, rejectInvitation } from "../../services/groups.js";
import Alert from "../Alert.jsx";

export default function InvitationsList({ disabled }) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [processingIds, setProcessingIds] = useState(() => new Set());

  const hasRows = rows.length > 0;

  useEffect(() => {
    const run = async () => {
      setError("");
      setInfo("");
      setLoading(true);
      try {
        const data = await getInvitations();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || "Failed to load invitations");
      } finally {
        setLoading(false);
      }
    };
    if (!disabled) run();
    else {
      setRows([]);
      setError("");
      setInfo("");
    }
  }, [disabled]);

  const setBusy = (id, on) =>
    setProcessingIds(prev => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });

  const getId = (inv) => inv?.requestId ?? inv?.id;

  const handle = async (inv, action) => {
    const id = getId(inv);
    if (!id) return;
    setError("");
    setInfo("");
    setBusy(id, true);
    try {
      if (action === "accept") {
        await acceptInvitation(id);
        setInfo("Invitation accepted.");
      } else {
        await rejectInvitation(id);
        setInfo("Invitation declined.");
      }
      setRows(prev => prev.filter(x => getId(x) !== id));
    } catch (e) {
      setError(e?.message || "Action failed");
    } finally {
      setBusy(id, false);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="fw-semibold">Invitations</div>
        {loading && (
          <div className="d-inline-flex align-items-center gap-2 small text-dark">
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            Loading…
          </div>
        )}
      </div>

      {info && <Alert type="success">{info}</Alert>}
      {error && <Alert type="danger">{error}</Alert>}

      {disabled ? (
        <p className="empty-state mb-3">No invitations.</p>
      ) : !hasRows && !loading ? (
        <p className="empty-state mb-3">No invitations.</p>
      ) : (
        rows.map(inv => {
          const id = getId(inv);
          const groupName =
            inv?.groupName || inv?.group?.name || (inv?.groupId ? `Group #${inv.groupId}` : "Group");
          const busy = processingIds.has(id);
          return (
            <div key={id} className="group-row">
              <div className="d-flex flex-column">
                <span className="fw-semibold">{groupName}</span>
                {inv?.requestedBy?.name && (
                  <small className="text-muted">Invited by {inv.requestedBy.name}</small>
                )}
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-success"
                  disabled={busy}
                  onClick={() => handle(inv, "accept")}
                  aria-label={`Accept invitation to ${groupName}`}
                >
                  {busy ? (
                    <span className="d-inline-flex align-items-center gap-2">
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      Accepting…
                    </span>
                  ) : "Accept"}
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={busy}
                  onClick={() => handle(inv, "decline")}
                  aria-label={`Decline invitation to ${groupName}`}
                >
                  {busy ? "…" : "Decline"}
                </button>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
