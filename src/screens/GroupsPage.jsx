import Header from "../components/header";
import { useUser } from "../context/useUser.jsx";
import InvitationsList from "../components/groups/InvitationsList.jsx";
import CreateGroupForm from "../components/groups/CreateGroupForm.jsx";
import Alert from "../components/Alert.jsx";
import "../css/groups.css";

export default function GroupsPage() {
  const { user } = useUser();
  const isSignedIn = Boolean(user?.username);

  return (
    <>
      <Header />
      <div className="groups-page container my-4">
        <div className="text-center mb-3">
          <h2 className="mb-1">Groups</h2>
          <p className="text-muted m-0">Manage your movie watch groups</p>
        </div>

        {!isSignedIn && (
          <Alert type="warning">Please sign in to manage groups.</Alert>
        )}

        <div className="row g-3">
          {/* My groups + Invitations */}
          <div className="col-12 col-lg-6">
            <div className="card border-2">
              <div className="card-header fw-semibold">My groups</div>
              <div className="card-body">
                <InvitationsList disabled={!isSignedIn} />

                <hr className="my-3" />

                {/* Placeholder – täytetään kun GET-endpoint valmis */}
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

          {/* All groups (placeholder) */}
          <div className="col-12 col-lg-6">
            <div className="card border-2">
              <div className="card-header fw-semibold">All groups</div>
              <div className="card-body">
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

          {/* Create */}
          <div className="col-12">
            <div className="card border-2">
              <div className="card-header fw-semibold">Create new group</div>
              <div className="card-body">
                <CreateGroupForm disabled={!isSignedIn} />
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
