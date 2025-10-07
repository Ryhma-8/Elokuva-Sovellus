import { useMemo, useState } from "react";
import { createGroup } from "../../services/groups.js";
import Alert from "../Alert.jsx";

export default function CreateGroupForm({ disabled, onCreated }) {
  // Lomakkeen tilat
  const [groupName, setGroupName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  // Käyttölogiikka: voiko lähettää
  const canSubmit = useMemo(() => {
    return !disabled && String(groupName).trim().length > 0 && !submitting;
  }, [disabled, groupName, submitting]);

  // Lähetys
  const onCreate = async () => {
    setOk("");
    setErr("");

    const name = String(groupName || "").trim();
    if (!name) {
      setErr("Group name is required");
      return;
    }

    try {
      setSubmitting(true);
      // Lähetetään tyhjä memberEmails
      const res = await createGroup({ groupName: name, memberEmails: [] });
      setOk("Group created successfully.");
      setGroupName("");
      if (typeof onCreated === "function") onCreated(res);
    } catch (e) {
      setErr(e?.message || "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {ok && <Alert type="success">{ok}</Alert>}
      {err && <Alert type="danger">{err}</Alert>}

      {/* Nimi */}
      <div className="mb-3">
        <label className="form-label">Group name</label>
        <input
          type="text"
          className="form-control"
          placeholder=""
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          disabled={disabled || submitting}
          maxLength={30} 
        />
        <div className="form-text">{groupName.length}/30</div>
      </div>

      {/* Lähetysnappi */}
      <div className="d-flex justify-content-end">
        <button
          className="btn btn-warning fw-semibold"
          disabled={!canSubmit}
          onClick={onCreate}
        >
          {submitting ? (
            <span className="d-inline-flex align-items-center gap-2">
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              />
              Creating…
            </span>
          ) : (
            "Create group"
          )}
        </button>
      </div>
    </>
  );
}
