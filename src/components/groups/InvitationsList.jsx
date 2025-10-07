import Alert from "../Alert.jsx";

export default function InvitationsList({ disabled = true }) {
  // Ei tehdä hakuja ollenkaan. vain staattinen viesti.
  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="fw-semibold">Invitations</div>
      </div>

      <Alert type="warning">Not Found</Alert>
      <p className="empty-state mb-3">No invitations.</p>
    </>
  );
}
