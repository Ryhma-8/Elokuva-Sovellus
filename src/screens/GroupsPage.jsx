import { useState } from "react";
import { useUser } from "../context/useUser.jsx";
import "../css/groups.css";

// HUOM: Tässä EI kutsuta backendia eikä käytetä mockia.
// - "My groups" ja "All groups" näyttävät tyhjät tilat.
// - Create-lomakkeessa voi lisätä sähköposteja chippeinä ja poistaa niitä,
//   mutta "Create group" -nappi on yhä disabloitu (ei backend-yhteyttä).

export default function GroupsPage() {
  // Haetaan käyttäjäkonteksti (UserProvider) – header käyttää user.username:a
  const { user } = useUser();
  const isSignedIn = Boolean(user?.username);

  // Lomakkeen tila: ryhmän nimi + sähköpostichipit
  const [groupName, setGroupName] = useState("");
  const [emailsInput, setEmailsInput] = useState("");
  const [inviteEmails, setInviteEmails] = useState([]); // max 5
  const [emailError, setEmailError] = useState("");

  // Säännöt käyttöliittymän disabloinnille:
  // - Kenttiin voi kirjoittaa vain, jos käyttäjä on kirjautunut
  // - Luonti on silti estetty kunnes backend on kytketty
  const canInteract = isSignedIn;
  const canSubmit = false; // pidetään false, kunnes backend on liitetty

  // Kevyt email-validointi
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Lisää yksi email syötekentästä chippiin
  const addEmailFromInput = () => {
    const raw = emailsInput.trim();
    if (!raw) return;

    // Poistetaan mahdollinen lopetusmerkki (pilkku tai puolipiste)
    const candidate = raw.replace(/[,\s;]+$/, "");

    if (!emailRegex.test(candidate)) {
      setEmailError("Invalid email address");
      return;
    }
    if (inviteEmails.includes(candidate)) {
      setEmailError("Duplicate email");
      return;
    }
    if (inviteEmails.length >= 5) {
      setEmailError("You can add up to 5");
      return;
    }

    setInviteEmails((prev) => [...prev, candidate]);
    setEmailsInput("");
    setEmailError("");
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

  return (
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

      {/* Kaksi ensimmäistä korttia vierekkäin isolla näytöllä (Bootstrap-grid),
          pinoutuvat allekkain pienillä näytöillä */}
      <div className="row g-3">
        {/* My groups */}
        <div className="col-12 col-lg-6">
          <div className="card border-2">
            <div className="card-header fw-semibold">My groups</div>
            <div className="card-body">
              {/* Tyhjä tila: ei dataa ennen backend-kytkentää */}
              <p className="empty-state mb-3">No groups yet.</p>

              {/* Esimerkkirivi (rakenne valmiina, mutta disabloitu).
                  Kun data tulee, toistetaan tämä map:illa. */}
              <div className="group-row">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-semibold">Group name</span>
                  {/* Jäsenten "dropdown": tässä vaiheessa pelkkä disabloitu select */}
                  <select className="form-select form-select-sm member-select" disabled>
                    <option>Members</option>
                  </select>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {/* Ownerille myöhemmin "Delete group", memberille "Leave group".
                      Nyt disabloituna. */}
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

              {/* Esimerkkirivi rakenteesta (disabloitu).
                  Kun data tulee, näytetään oikea nimi ja jäsenmäärä. */}
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
                  disabled={!canInteract}
                />
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
                          disabled={!canInteract}
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
                    disabled={!canInteract}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={addEmailFromInput}
                    disabled={!canInteract || !emailsInput.trim() || inviteEmails.length >= 5}
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

              {/* Lähetysnappi – disabloitu kunnes backend on kytketty */}
              <div className="d-flex justify-content-end">
                <button className="btn btn-warning fw-semibold" disabled={!canInteract || !canSubmit}>
                  Create group
                </button>
              </div>

              {/* Pieni huomautus kehitystilasta */}
              <p className="text-muted small mt-3 mb-0">
                Backend connection not added yet: the Create button is disabled for now.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
