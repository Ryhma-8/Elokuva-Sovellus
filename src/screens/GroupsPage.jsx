import { useEffect, useMemo, useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { useUser } from "../context/useUser.jsx";
import Alert from "../components/Alert.jsx";
import CreateGroupForm from "../components/groups/CreateGroupForm.jsx";
import {
  getAllGroups,
  getUserGroups,
  sendJoinRequest,
  acceptJoinRequest,
  rejectJoinRequest,
  kickFromGroup,
  leaveGroup,
  deleteGroup,
} from "../services/groups.js";
import "../css/groups.css";
import { Link } from "react-router-dom";

export default function GroupsPage() {
  const { user } = useUser();
  const isSignedIn = Boolean(user?.username);

  // Tilat
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [errLeft, setErrLeft] = useState("");
  const [errRight, setErrRight] = useState("");
  const [loading, setLoading] = useState(false);

  // Ryhmäkohtainen valinta: { [groupId]: { username, status } }
  const [selected, setSelected] = useState({});

  // Ryhmäkohtainen "kiireinen"-tila (estää tuplaklikkaukset)
  const [busy, setBusy] = useState(new Set());

  // Apuri: merkitse rivi kiireiseksi / vapaaksi
  const setRowBusy = (groupId, on) => {
    setBusy((prev) => {
      const next = new Set(prev);
      on ? next.add(groupId) : next.delete(groupId);
      return next;
    });
  };

  // Lataa molemmat listat rinnakkain
  const reloadLists = async () => {
    const [mine, all] = await Promise.allSettled([
      isSignedIn ? getUserGroups() : Promise.resolve([]),
      getAllGroups(),
    ]);
    if (mine.status === "fulfilled") setMyGroups(mine.value || []);
    if (all.status === "fulfilled") setAllGroups(all.value || []);
  };

  useEffect(() => {
    const load = async () => {
      setErrLeft("");
      setErrRight("");
      try {
        setLoading(true);
        await reloadLists();
      } catch (e) {
        setErrLeft(e?.message || "Failed to load your groups");
        setErrRight(e?.message || "Failed to load groups");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isSignedIn]);

  // Joined-jäsenten määrä
  const joinedCount = (g) =>
    (g?.members || []).reduce((acc, m) => acc + (m.status === "joined" ? 1 : 0), 0);

  // Oma rooli per groupId
  const myRoleById = useMemo(() => {
    const m = new Map();
    for (const g of myGroups) m.set(g.group_id, g.user_role);
    return m;
  }, [myGroups]);

  // Päivitä yhden ryhmän data myGroups-tilassa
  const patchGroup = (groupId, updater) => {
    setMyGroups((prev) => prev.map((g) => (g.group_id === groupId ? updater(g) : g)));
  };

  // Toiminnot
  const onAccept = async (group, member) => {
    setErrLeft("");
    setRowBusy(group.group_id, true);
    try {
      await acceptJoinRequest({ groupId: group.group_id, senderName: member.username });

      // Optimistinen päivitys: status -> joined
      patchGroup(group.group_id, (g) => ({
        ...g,
        members: (g.members || []).map((m) =>
          m.username === member.username ? { ...m, status: "joined" } : m
        ),
      }));

      // Päivitä myös selected, jotta nappi vaihtuu Kickiksi heti
      setSelected((prev) => {
        const cur = prev[group.group_id];
        if (cur?.username === member.username) {
          return { ...prev, [group.group_id]: { ...cur, status: "joined" } };
        }
        return prev;
      });

      // Hae tuore laskuri taustalla
      reloadLists();
    } catch (e) {
      setErrLeft(e?.message || "Accept failed");
    } finally {
      setRowBusy(group.group_id, false);
    }
  };

  const onDecline = async (group, member) => {
    setErrLeft("");
    setRowBusy(group.group_id, true);
    try {
      await rejectJoinRequest({ groupId: group.group_id, senderName: member.username });

    // Optimistinen päivitys: poista pending-jäsen
      patchGroup(group.group_id, (g) => ({
        ...g,
        members: (g.members || []).filter(
          (m) => !(m.username === member.username && m.status !== "joined")
        ),
      }));

      // Tyhjennä valinta, jos kohdistui poistettuun
      setSelected((prev) => {
        const cur = prev[group.group_id];
        if (cur?.username === member.username) {
          const { [group.group_id]: _, ...rest } = prev;
          return rest;
        }
        return prev;
      });

      reloadLists();
    } catch (e) {
      setErrLeft(e?.message || "Decline failed");
    } finally {
      setRowBusy(group.group_id, false);
    }
  };

  const onKick = async (group, member) => {
    setErrLeft("");
    setRowBusy(group.group_id, true);
    try {
      await kickFromGroup({ groupId: group.group_id, senderName: member.username });

      // Optimistinen päivitys: poista jäsen
      patchGroup(group.group_id, (g) => ({
        ...g,
        members: (g.members || []).filter((m) => m.username !== member.username),
      }));

      setSelected((prev) => {
        const cur = prev[group.group_id];
        if (cur?.username === member.username) {
          const { [group.group_id]: _, ...rest } = prev;
          return rest;
        }
        return prev;
      });

      reloadLists();
    } catch (e) {
      setErrLeft(e?.message || "Kick failed");
    } finally {
      setRowBusy(group.group_id, false);
    }
  };

  const onLeave = async (group) => {
    setErrLeft("");
    setRowBusy(group.group_id, true);
    try {
      await leaveGroup({ groupId: group.group_id });
      setMyGroups((prev) => prev.filter((g) => g.group_id !== group.group_id));
      reloadLists();
    } catch (e) {
      setErrLeft(e?.message || "Leave failed");
    } finally {
      setRowBusy(group.group_id, false);
    }
  };

  const onDelete = async (group) => {
    setErrLeft("");
    setRowBusy(group.group_id, true);
    try {
      await deleteGroup({ groupId: group.group_id });
      setMyGroups((prev) => prev.filter((g) => g.group_id !== group.group_id));
      reloadLists();
    } catch (e) {
      setErrLeft(e?.message || "Delete failed");
    } finally {
      setRowBusy(group.group_id, false);
    }
  };

  const onJoin = async (groupId, groupName) => {
    setErrRight("");
    setRowBusy(groupId, true);
    try {
      await sendJoinRequest(groupId);

      // Optimistinen lisäys: näkyy heti requested-statuksena
      setMyGroups((prev) => {
        if (prev.some((g) => g.group_id === groupId)) return prev;
        return [
          ...prev,
          { group_id: groupId, group_name: groupName, user_role: "requested", members: [] },
        ];
      });

      // Refetch jotta jäsenlista ja valinnat täyttyvät heti
      await reloadLists();
    } catch (e) {
      setErrRight(e?.message || "Join request failed");
    } finally {
      setRowBusy(groupId, false);
    }
  };

  // Toimintonapit dropdownin viereen
  const inlineActions = (group, member) => {
    if (!member) return null;
    const isOwner = group.user_role === "owner";
    const me = user?.username;
    const kickingSelf = member.username === me;

    if (member.status === "requested" && isOwner) {
      return (
        <>
          <button
            className="btn btn-success"
            disabled={busy.has(group.group_id)}
            onClick={() => onAccept(group, member)}
          >
            {busy.has(group.group_id) ? "…" : "Accept"}
          </button>
          <button
            className="btn btn-outline-secondary"
            disabled={busy.has(group.group_id)}
            onClick={() => onDecline(group, member)}
          >
            {busy.has(group.group_id) ? "…" : "Decline"}
          </button>
        </>
      );
    }

    if (member.status === "joined" && isOwner && !kickingSelf) {
      return (
        <button
          className="btn btn-outline-danger"
          disabled={busy.has(group.group_id)}
          onClick={() => onKick(group, member)}
          title="Remove member"
        >
          {busy.has(group.group_id) ? "…" : "Kick"}
        </button>
      );
    }

    return null;
  };

  // Normalisoi jäsenmäärä "All groups" -listaan
  const normalizeCount = (g) => {
    const raw = g.count ?? g.member_count ?? g.members ?? 0;
    if (typeof raw === "number") return raw;
    if (Array.isArray(raw)) return raw.length;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  return (
    <>
      <Header />
      <div className="groups-page container my-4">
        <div className="text-center mb-3">
          <h2 className="mb-1">Groups</h2>
          <p className="text-muted m-0">Manage your movie watch groups</p>
        </div>

        {!isSignedIn && <Alert type="warning">Please sign in to manage groups.</Alert>}

        <div className="row g-3">
          {/* Vasen palsta: My groups */}
          <div className="col-12 col-lg-6">
            <div className="card border-2">
              <div className="card-header fw-semibold">My groups</div>
              <div className="card-body">
                <div className="fw-semibold mb-2">My groups</div>
                {errLeft && <Alert type="danger">{errLeft}</Alert>}

                {!myGroups.length && !errLeft && <p className="empty-state">No groups yet.</p>}

                {myGroups.map((g) => {
                  const count = joinedCount(g);
                  const current = selected[g.group_id];
                  const canDelete = g.user_role === "owner";
                  const canLeave = g.user_role === "member";

                  return (
                    <div key={g.group_id} className="group-row my-group-row">
                      {/* YLÄRIVI: vasen info + oikea kontrollipaneeli */}
                      <div className="d-flex align-items-center gap-2">
                        {/* Info vasemmalle */}
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-center gap-2">
                            <Link to="/group" state={{groupId:g.group_id}}  className="fw-semibold">{g.group_name}</Link>
                            <span className="badge bg-primary-subtle text-primary border">
                              {g.user_role}
                            </span>
                          </div>
                          <small className="text-muted">Members: {count}</small>
                        </div>

                        {/* Oikealle: dropdown + Delete/Leave */}
                        <div className="d-flex align-items-center gap-2 ms-auto">
                          <select
                            className="form-select form-select-sm member-select"
                            value={current?.username || ""}
                            onChange={(e) => {
                              const u = e.target.value;
                              const m =
                                (g.members || []).find((x) => x.username === u) || null;
                              setSelected((prev) => ({ ...prev, [g.group_id]: m }));
                            }}
                          >
                            <option value="">Members</option>
                            {(g.members || []).map((m) => (
                              <option key={m.username} value={m.username}>
                                {m.username} — {m.status}
                              </option>
                            ))}
                          </select>

                          {canDelete ? (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => onDelete(g)}
                              disabled={busy.has(g.group_id)}
                            >
                              {busy.has(g.group_id) ? "…" : "Delete group"}
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => onLeave(g)}
                              disabled={busy.has(g.group_id) || !canLeave}
                              title={!canLeave ? "Owner can't leave own group" : "Leave group"}
                            >
                              {busy.has(g.group_id) ? "…" : "Leave group"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ALARIVI: toimintonapit leveänä, näytetään vain jos valitulle jäsenelle on nappeja */}
                      {(() => {
                        const actions = inlineActions(g, current);
                        if (!actions) return null;
                        return <div className="actions-row mt-2">{actions}</div>;
                      })()}
                    </div>
                   
                  );
                })}
              </div>
            </div>
          </div>

          {/* Oikea palsta: All groups */}
          <div className="col-12 col-lg-6">
            <div className="card border-2">
              <div className="card-header fw-semibold">All groups</div>
              <div className="card-body">
                <div className="fw-semibold mb-2">All groups</div>
                {errRight && <Alert type="danger">{errRight}</Alert>}

                {!allGroups.length && !errRight && <p className="empty-state">No groups found.</p>}

                {allGroups.map((g) => {
                  const id = g.id ?? g.group_id ?? g.groupId;
                  const name = g.name ?? g.group_name ?? "Group";
                  const normalizedCount = normalizeCount(g);

                  const myRole = myRoleById.get(id); // 'owner' | 'member' | 'requested' | undefined
                  const isMine = myRole === "owner" || myRole === "member";
                  const isRequested = myRole === "requested";

                  return (
                    <div key={id} className="group-row">
                      <div className="d-flex flex-column">
                        <span className="fw-semibold">{name}</span>
                        <small className="text-muted">Member count: {normalizedCount}</small>
                      </div>

                      {!isSignedIn ? (
                        <span className="badge bg-secondary-subtle text-secondary border">
                          Sign in to join
                        </span>
                      ) : isMine ? (
                        <span className="badge bg-secondary-subtle text-secondary border">
                          Already in group
                        </span>
                      ) : isRequested ? (
                        <span className="badge bg-primary-subtle text-primary border">
                          Request sent
                        </span>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary"
                          disabled={busy.has(id)}
                          onClick={() => onJoin(id, name)}
                          title="Send join request"
                        >
                          {busy.has(id) ? "…" : "Request to join"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Create new group */}
          <div className="col-12">
            <div className="card border-2">
              <div className="card-header fw-semibold">Create new group</div>
              <div className="card-body">
                <CreateGroupForm disabled={!isSignedIn} onCreated={() => reloadLists()} />
                {!isSignedIn && (
                  <p className="text-muted small mt-3 mb-0">Please sign in to create a group.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center mt-3">
            <small className="text-muted">Loading…</small>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
