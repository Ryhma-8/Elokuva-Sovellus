import { refreshAccessToken } from "./refreshToken.js";

const BASE = import.meta.env.VITE_API_URL;

export const GROUP_MAX_INVITES = 20;

// Yleinen vastauskäsittelijä.
async function handle(r) {
  let data = null;
  try { data = await r.json(); } catch {}
  if (!r.ok) {
    const msg =
      data?.err?.message ||
      data?.message ||
      r.statusText ||
      "Request failed";
    const e = new Error(msg);
    e.status = r.status;
    e.data = data;
    throw e;
  }
  return data;
}

// Autentikoitu pyyntö, jossa 401 -> token refresh -> yksi retry.
async function authed(path, { method = "GET", body } = {}, retry = true) {
  // Haetaan access token sessiosta.
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const token = user?.accessToken;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include"
  });

  // Jos token vanhentui, kokeillaan päivittää kerran.
  if (res.status === 401 && retry) {
    await refreshAccessToken();
    return authed(path, { method, body }, false);
  }

  return handle(res);
}

/* Julkiset API-funktiot */

// Luodaan uusi ryhmä.
export async function createGroup({ groupName, memberEmails }) {
  return authed(`/api/group/new_group`, {
    method: "POST",
    body: { groupName, memberEmails }
  });
}

// Haetaan kaikki ryhmät (mukana laskettu jäsenmäärä).
export async function getAllGroups() {
  const r = await fetch(`${BASE}/api/group/get_all`);
  return handle(r);
}

// Haetaan käyttäjän omat ryhmät (role + members[] statuksineen).
export async function getUserGroups() {
  return authed(`/api/group/get_by_user`);
}

// Lähetetään liittymispyyntö ryhmään.
export async function sendJoinRequest(groupId) {
  return authed(`/api/group/send_join_request`, {
    method: "POST",
    body: { groupId }
  });
}

// Owner hyväksyy liittymispyynnön.
export async function acceptJoinRequest({ groupId, senderName }) {
  return authed(`/api/group/accept_join_request`, {
    method: "POST",
    body: { groupId, senderName }
  });
}

// Owner hylkää liittymispyynnön.
export async function rejectJoinRequest({ groupId, senderName }) {
  return authed(`/api/group/reject_join_request`, {
    method: "POST",
    body: { groupId, senderName }
  });
}

// Owner poistaa käyttäjän ryhmästä.
export async function kickFromGroup({ groupId, senderName }) {
  return authed(`/api/group/kick_from_group`, {
    method: "POST",
    body: { groupId, senderName }
  });
}

// Jäsen poistuu ryhmästä itse.
export async function leaveGroup({ groupId }) {
  return authed(`/api/group/leave_group`, {
    method: "POST",
    body: { groupId }
  });
}

// Owner poistaa koko ryhmän.
export async function deleteGroup({ groupId }) {
  return authed(`/api/group/delete`, {
    method: "DELETE",
    body: { groupId }
  });
}
