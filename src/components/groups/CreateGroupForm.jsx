import { useMemo, useState } from "react";
import { createGroup } from "../../services/groups.js";
import Alert from "../Alert.jsx";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateGroupForm({ disabled }) {
  const [groupName, setGroupName] = useState("");
  const [emailsInput, setEmailsInput] = useState("");
  const [inviteEmails, setInviteEmails] = useState([]);
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const canInteract = !disabled;
  const canSubmit = useMemo(() => {
    return canInteract && String(groupName).trim().length > 0 && !submitting;
  }, [canInteract, groupName, submitting]);

  const addEmails = (candidates) => {
    const items = candidates.map(s => String(s).trim()).filter(Boolean);
    if (!items.length) return;

    let next = [...inviteEmails];
    let lastError = "";

    for (const raw of items) {
      if (next.length >= 5) { lastError = "You can add up to 5"; break; }
      if (!emailRegex.test(raw)) { lastError = "Invalid email address"; continue; }
      if (next.includes(raw)) { lastError = "Duplicate email"; continue; }
      next.push(raw);
    }
    setInviteEmails(next);
    setEmailsInput("");
    setEmailError(lastError || "");
  };

  const addEmailFromInput = () => {
    const raw = emailsInput.trim();
    if (!raw) return;
    addEmails(raw.split(/[,\s;]+/).filter(Boolean));
  };

  const removeEmail = (email) => {
    setInviteEmails(prev => prev.filter(x => x !== email));
    setEmailError("");
  };

  const onEmailsKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      if (!canInteract) return;
      addEmailFromInput();
    }
  };

  const onCreate = async () => {
    setOk(""); setErr("");
    const name = String(groupName || "").trim();
    if (!name) { setErr("Group name is required"); return; }

    try {
      setSubmitting(true);
      await createGroup({ groupName: name, memberEmails: inviteEmails });
      setOk("Group created successfully.");
      setGroupName("");
      setInviteEmails([]);
      setEmailsInput("");
      setEmailError("");
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

      <div className="mb-3">
        <label className="form-label">Group name</label>
        <input
          type="text"
          className="form-control"
          placeholder="e.g. Friday Movie Night"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          disabled={!canInteract || submitting}
          maxLength={30}
        />
        <div className="form-text">{groupName.length}/30</div>
      </div>

      <div className="mb-2">
        <label className="form-label">Invite members by email (max 5)</label>

        {inviteEmails.length > 0 && (
          <div className="chips mb-2">
            {inviteEmails.map((email) => (
              <span key={email} className="chip">
                {email}
                <button
                  type="button"
                  className="chip-remove"
                  aria-label={`Remove ${email}`}
                  onClick={() => removeEmail(email)}
                  disabled={!canInteract || submitting}
                  title="Remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="email-controls">
          <input
            type="text"
            className="form-control"
            placeholder="Type an email and press Enter or tap Add"
            value={emailsInput}
            onChange={(e) => setEmailsInput(e.target.value)}
            onKeyDown={onEmailsKeyDown}
            disabled={!canInteract || submitting}
          />
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={addEmailFromInput}
            disabled={!canInteract || submitting || !emailsInput.trim() || inviteEmails.length >= 5}
            title="Add email"
          >
            Add
          </button>
        </div>

        <div className={`form-text ${emailError ? "error" : ""}`}>
          {emailError || "Use comma, semicolon or Enter to add."}
        </div>
        <div className="email-counter mt-1">{inviteEmails.length}/5</div>
      </div>

      <div className="d-flex justify-content-end">
        <button className="btn btn-warning fw-semibold" disabled={!canSubmit} onClick={onCreate}>
          {submitting ? (
            <span className="d-inline-flex align-items-center gap-2">
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              Creating…
            </span>
          ) : "Create group"}
        </button>
      </div>
    </>
  );
}
