import { useEffect, useMemo, useState } from "react";
import { useUser } from "../context/useUser.jsx";
import Header from "../components/header";
import {
  createGroup,
  getInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../services/groups.js";
import "../css/groups.css";


export default function GroupsPage() {
  // --- käyttäjäkonteksti ---
  const { user } = useUser();
  const isSignedIn = Boolean(user?.username);

  // --- create group -lomake ---
  const [groupName, setGroupName] = useState("");
  const [emailsInput, setEmailsInput] = useState("");
  const [inviteEmails, setInviteEmails] = useState([]); // max 5
  const [emailError, setEmailError] = useState("");

  // --- ilmoitukset / lataustilat sivun tasolla ---
  const [submitting, setSubmitting] = useState(false); // create group -lähetys
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // --- invitations-tila ---
  const [invLoading, setInvLoading] = useState(false);
  const [invError, setInvError] = useState("");
  const [invitations, setInvitations] = useState([]); // pending-kutsut
  const [processingIds, setProcessingIds] = useState(() => new Set()); // rivikohtainen lataus (accept/decline)

  // Lomakkeen käytettävyys: pitää olla kirjautunut
  const canInteract = isSignedIn;
  const canSubmit = useMemo(() => {
    return canInteract && String(groupName).trim().length > 0 && !submitting;
  }, [canInteract, groupName, submitting]);

  // --- kevyt email-validointi ---
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Lisää useampi email kerralla (pilkku/puolipiste/whitespace eroteltuna)
  const addEmails = (candidates) => {
    const items = candidates
      .map((s) => String(s).trim())
      .filter((s) => s.length > 0);

    if (items.length === 0) return;

    let next = [...inviteEmails];
    let lastError = "";

    for (const raw of items) {
      if (next.length >= 5) {
        lastError = "You can add up to 5";
        break;
      }
      if (!emailRegex.test(raw)) {
        lastError = "Invalid email address";
        continue;
      }
      if (next.includes(raw)) {
        lastError = "Duplicate email";
        continue;
      }
      next.push(raw);
    }

    setInviteEmails(next);
    setEmailsInput("");
    setEmailError(lastError || "");
  };

  // Lisää yksi email syötekentästä chippinä
  const addEmailFromInput = () => {
    const raw = emailsInput.trim();
    if (!raw) return;
    const parts = raw.split(/[,\s;]+/).filter(Boolean);
    addEmails(parts);
  };

  // Enter, pilkku tai puolipiste lisäävät chippinä
  const onEmailsKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      if (!canInteract) return;
      addEmailFromInput();
    }
  };

  // Poista chip
  const removeEmail = (email) => {
    setInviteEmails((prev) => prev.filter((x) => x !== email));
    setEmailError("");
  };

  // --- kutsujen nouto ---
  useEffect(() => {
    // Noudetaan invitations vain kirjautuneelle
    const fetchInvitations = async () => {
      setInvError("");
      setInvLoading(true);
      try {
        const data = await getInvitations();
        // Oletus: data on taulukko kutsuja; pidetään sellaisenaan.
        setInvitations(Array.isArray(data) ? data : []);
      } catch (err) {
        setInvError(err?.message || "Failed to load invitations");
        setInvitations([]);
      } finally {
        setInvLoading(false);
      }
    };

    if (isSignedIn) {
      fetchInvitations();
    } else {
      // Uloskirjautuneena tyhjennetään näkymä
      setInvitations([]);
      setInvError("");
    }
  }, [isSignedIn]);

  // Apufunktio: rivin tunniste (backend voi palauttaa id tai requestId)
  const getRequestId = (inv) => inv?.requestId ?? inv?.id;

  // --- Accept / Decline käsittelijät ---
  const withRowProcessing = async (requestId, fn) => {
    setProcessingIds((prev) => new Set(prev).add(requestId));
    try {
      await fn();
      // Onnistuminen → poista rivi listasta
      setInvitations((prev) => prev.filter((x) => getRequestId(x) !== requestId));
    } catch (err) {
      setErrorMsg(err?.message || "Action failed");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const onAccept = async (inv) => {
    const requestId = getRequestId(inv);
    if (!requestId) return;
    setSuccessMsg("");
    setErrorMsg("");
    await withRowProcessing(requestId, async () => {
      const res = await acceptInvitation(requestId);
      // Voidaan näyttää onnistumisviesti; lisäys My groups -listaan tehdään myöhemmin kun GET-endpoint valmis
      setSuccessMsg("Invitation accepted.");
      return res;
    });
  };

  const onDecline = async (inv) => {
    const requestId = getRequestId(inv);
    if (!requestId) return;
    setSuccessMsg("");
    setErrorMsg("");
    await withRowProcessing(requestId, async () => {
      const res = await rejectInvitation(requestId);
      setSuccessMsg("Invitation declined.");
      return res;
    });
  };

  // --- ryhmän luonti ---
  const onCreateGroup = async () => {
    setSuccessMsg("");
    setErrorMsg("");

    const name = String(groupName || "").trim();
    if (!name) {
      setErrorMsg("Group name is required");
      return;
    }

    try {
      setSubmitting(true);
      await createGroup({
        groupName: name,
        memberEmails: inviteEmails,
      });

      setSuccessMsg("Group created successfully.");
      setGroupName("");
      setInviteEmails([]);
      setEmailsInput("");
      setEmailError("");
    } catch (err) {
      setErrorMsg(err?.message || "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Sivun header navigaatioon */}
      <Header />

      <div className="groups-page container my-4">
        {/* Sivun otsikko */}
        <div className="text-center mb-3">
          <h2 className="mb-1">Groups</h2>
          <p className="text-muted m-0">Manage your movie watch groups</p>
        </div>

        {/* Ilmoitus: käyttäjän täytyy kirjautua, jotta voi hallita ryhmiä */}
        {!isSignedIn && (
          <div className="alert alert-warning" role="alert">
            Please sign in to manage groups.
          </div>
        )}

        {/* Yleistason onnistumis-/virheilmoitukset */}
        {successMsg && (
          <div className="alert alert-success" role="alert">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="alert alert-danger" role="alert">
            {errorMsg}
          </div>
        )}

        {/* Kaksi ensimmäistä korttia vierekkäin isolla näytöllä */}
        <div className="row g-3">
          {/* My groups */}
          <div className="col-12 col-lg-6">
            <div className="card border-2">
              <div className="card-header fw-semibold">My groups</div>
              <div className="card-body">
                {/* Invitations-osion otsikko */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="fw-semibold">Invitations</div>
                  {/* Latausindikaattori kutsuille */}
                  {invLoading && (
                    <div className="d-inline-flex align-items-center gap-2 small text-dark">
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      Loading…
                    </div>
                  )}
                </div>

                {/* Invitations-lista */}
                {isSignedIn ? (
                  invitations.length === 0 && !invLoading ? (
                    <p className="empty-state mb-3">No invitations.</p>
                  ) : (
                    invitations.map((inv) => {
                      const requestId = getRequestId(inv);
                      const groupNameText =
                        inv?.groupName || inv?.group?.name || (inv?.groupId ? `Group #${inv.groupId}` : "Group");
                      const busy = processingIds.has(requestId);
                      return (
                        <div key={requestId} className="group-row">
                          <div className="d-flex flex-column">
                            <span className="fw-semibold">{groupNameText}</span>
                            {/* Valinnainen lisäteksti – esim. invited by */}
                            {inv?.requestedBy?.name && (
                              <small className="text-muted">
                                Invited by {inv.requestedBy.name}
                              </small>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <button
                              className="btn btn-sm btn-success"
                              disabled={busy}
                              onClick={() => onAccept(inv)}
                              aria-label={`Accept invitation to ${groupNameText}`}
                            >
                              {busy ? (
                                <span className="d-inline-flex align-items-center gap-2">
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                  />
                                  Accepting…
                                </span>
                              ) : (
                                "Accept"
                              )}
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              disabled={busy}
                              onClick={() => onDecline(inv)}
                              aria-label={`Decline invitation to ${groupNameText}`}
                            >
                              {busy ? "…" : "Decline"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )
                ) : (
                  <p className="empty-state mb-3">No invitations.</p>
                )}

                {/* Jakoviiva ennen varsinaista My groups -listaa */}
                <hr className="my-3" />

                {/* Varsinainen My groups -lista (placeholder toistaiseksi) */}
                <p className="empty-state mb-3">No groups yet.</p>

                <div className="group-row">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold">Group name</span>
                    <select className="form-select form-select-sm member-select" disabled>
                      <option>Members</option>
                    </select>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-sm btn-outline-danger" disabled>
                      Delete group
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" disabled>
                      Leave group
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* All groups */}
          <div className="col-12 col-lg-6">
            <div className="card border-2">
              <div className="card-header fw-semibold">All groups</div>
              <div className="card-body">
                {/* Tyhjä tila: ei dataa ennen backend-kytkentää */}
                <p className="empty-state mb-3">No groups found.</p>

                <div className="group-row">
                  <div className="d-flex flex-column">
                    <span className="fw-semibold">Group name</span>
                    <small className="text-muted">Member count: 0</small>
                  </div>
                  <button className="btn btn-sm btn-outline-primary" disabled>
                    Send a joining request
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Create new group */}
          <div className="col-12">
            <div className="card border-2">
              <div className="card-header fw-semibold">Create new group</div>
              <div className="card-body">
                {/* Nimi-kenttä */}
                <div className="mb-3">
                  <label className="form-label">Group name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Friday Movie Night"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    disabled={!canInteract || submitting}
                    maxLength={30} // DB:n varchar(30) varalta
                  />
                  <div className="form-text">{groupName.length}/30</div>
                </div>

                {/* Sähköpostit: chip-tyylinen lisäys + Add-nappi mobiilia varten */}
                <div className="mb-2">
                  <label className="form-label">Invite members by email (max 5)</label>

                  {/* Chip-lista */}
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

                  {/* Syöte + Add-nappi vierekkäin */}
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
                      disabled={
                        !canInteract ||
                        submitting ||
                        !emailsInput.trim() ||
                        inviteEmails.length >= 5
                      }
                      title="Add email"
                    >
                      Add
                    </button>
                  </div>

                  {/* Virheviesti + laskuri */}
                  <div className={`form-text ${emailError ? "error" : ""}`}>
                    {emailError || "Use comma, semicolon or Enter to add."}
                  </div>
                  <div className="email-counter mt-1">{inviteEmails.length}/5</div>
                </div>

                {/* Lähetysnappi */}
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-warning fw-semibold"
                    disabled={!canSubmit}
                    onClick={onCreateGroup}
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

                {/* Pieni huomautus kehitystilasta */}
                <p className="text-muted small mt-3 mb-0">
                  Backend endpoints for lists are not wired yet. Invitations work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
