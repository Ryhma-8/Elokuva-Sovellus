import { useMemo, useState } from "react";
import { createGroup, GROUP_MAX_INVITES } from "../../services/groups.js";
import Alert from "../Alert.jsx";

// Sähköpostin perusvalidointi
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateGroupForm({ disabled, onCreated = () => {} }) {
  // --- lomake-tilat ---
  const [groupName, setGroupName] = useState("");
  const [emailsInput, setEmailsInput] = useState("");
  const [inviteEmails, setInviteEmails] = useState([]);   // chip-lista lisättävistä jäsenistä
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  // --- käyttölogiikka ---
  const canInteract = !disabled;
  const canSubmit = useMemo(() => {
    return canInteract && String(groupName).trim().length > 0 && !submitting;
  }, [canInteract, groupName, submitting]);

  // Lisää yhden emailin vain "Add"-napista
  const addOneEmail = () => {
    const raw = emailsInput.trim();
    // tyhjä kenttä → ei mitään
    if (!raw) return;

    // maksimi saavutettu
    if (inviteEmails.length >= GROUP_MAX_INVITES) {
      setEmailError(`You can add up to ${GROUP_MAX_INVITES}`);
      return;
    }

    // sähköpostimuoto tarkistus
    if (!emailRegex.test(raw)) {
      setEmailError("Invalid email address");
      return;
    }

    // duplikaattien esto
    if (inviteEmails.includes(raw)) {
      setEmailError("Duplicate email");
      return;
    }

    // kaikki ok → lisätään listaan
    setInviteEmails(prev => [...prev, raw]);
    setEmailsInput("");
    setEmailError("");
  };

  // Poista chip-listasta
  const removeEmail = (email) => {
    setInviteEmails(prev => prev.filter(x => x !== email));
    setEmailError("");
  };

  // Estetään Enter lisäämästä mitään (käytetään vain Add-nappia)
  const onEmailsKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault(); // ei lisäystä näillä
    }
  };

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
      // Lähetetään groupName + suora jäsenlista backendille
      await createGroup({ groupName: name, memberEmails: inviteEmails });
      setOk("Group created successfully.");
      // Tyhjennetään lomake
      setGroupName("");
      setInviteEmails([]);
      setEmailsInput("");
      setEmailError("");
      // Ilmoitetaan vanhemmalle (esim. GroupsPage) että listat voi refetchata
      onCreated();
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

      {/* Ryhmän nimi */}
      <div className="mb-3">
        <label className="form-label">Group name</label>
        <input
          type="text"
          className="form-control"
          placeholder="Type a group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          disabled={!canInteract || submitting}
          maxLength={30} // DB: varchar(30)
        />
        <div className="form-text">{groupName.length}/30</div>
      </div>

      {/* Jäsenten lisääminen: vain Add-napilla */}
      <div className="mb-2">
        <label className="form-label">
          Add members by email
        </label>

        {/* Chip-lista näkyviin jos on jäseniä */}
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

        {/* Syöte + Add-nappi (ei Enter-lisäystä) */}
        <div className="email-controls">
          <input
            type="text"
            className="form-control"
            placeholder="Type an email, then tap Add"
            value={emailsInput}
            onChange={(e) => setEmailsInput(e.target.value)}
            onKeyDown={onEmailsKeyDown} // estetään Enter/pilkku/puolipiste
            disabled={!canInteract || submitting}
          />
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={addOneEmail}
            disabled={
              !canInteract ||
              submitting ||
              !emailsInput.trim() ||
              inviteEmails.length >= GROUP_MAX_INVITES
            }
            title="Add email"
          >
            Add
          </button>
        </div>

        {/* Ohje/virhe + laskuri */}
        <div className={`form-text ${emailError ? "error" : ""}`}>
          {emailError || ""}
        </div>
        <div className="email-counter mt-1">
          {inviteEmails.length}/{GROUP_MAX_INVITES}
        </div>
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
