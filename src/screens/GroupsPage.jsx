import Header from "../components/header";
import { useUser } from "../context/useUser.jsx";
import InvitationsList from "../components/groups/InvitationsList.jsx";
import CreateGroupForm from "../components/groups/CreateGroupForm.jsx";
import MyGroupsList from "../components/groups/MyGroupsList.jsx";
import AllGroupsList from "../components/groups/AllGroupsList.jsx";
import Alert from "../components/Alert.jsx";
import "../css/groups.css";

export default function GroupsPage() {
  const { user } = useUser();
  const isSignedIn = Boolean(user?.username);

  return (
    <>
      <Header />
      <div className="groups-page container my-4">
        {/* Sivun otsikko */}
        <div className="text-center mb-3">
          <h2 className="mb-1">Groups</h2>
          <p className="text-muted m-0">Manage your movie watch groups</p>
        </div>

        {/* Ilmoitus kirjautumisesta */}
        {!isSignedIn && (
          <Alert type="warning">Please sign in to manage groups.</Alert>
        )}

        <div className="row g-3">
          {/* My groups -kortti (sis. Invitations + lista) */}
          <div className="col-12 col-lg-6">
            <div className="card border-2">
              <div className="card-header fw-semibold">My groups</div>
              <div className="card-body">
                {/* Invitations-osa */}
                <InvitationsList disabled={!isSignedIn} />
                <hr className="my-3" />
                {/* Omat ryhmät */}
                <MyGroupsList disabled={!isSignedIn} />
              </div>
            </div>
          </div>

          {/* All groups -kortti */}
          <div className="col-12 col-lg-6">
            <div className="card border-2">
              <div className="card-header fw-semibold">All groups</div>
              <div className="card-body">
                <AllGroupsList disabled={!isSignedIn} />
              </div>
            </div>
          </div>

          {/* Create new group -kortti */}
          <div className="col-12">
            <div className="card border-2">
              <div className="card-header fw-semibold">Create new group</div>
              <div className="card-body">
                <CreateGroupForm disabled={!isSignedIn} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
