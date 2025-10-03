.// - Toteutettuna: createGroup + invitations (get/accept/reject)

import { refreshAccessToken } from "./refreshToken.js";

const BASE = import.meta.env.VITE_API_URL;

// Yhtenäinen vastauskäsittely kuten reviews.js:ssä
async function handleResponse(r) {
  let data = null;
  try {
    data = await r.json();
  } catch {
    // ei bodya → data jää nulliksi
  }
  if (!r.ok) {
    // Poimitaan mahdollinen virheviesti backendiltä
    const msg =
      data?.message || data?.err?.message || r.statusText || "Request failed";
    const e = new Error(msg);
    e.status = r.status;
    e.data = data;
    throw e;
  }
  return data;
}

// Hakee access tokenin sessionStoragesta (UserProvider asettaa sen sisäänkirjautuessa)
function getAccessToken() {
  try {
    const raw = sessionStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.accessToken || null;
  } catch {
    return null;
  }
}

// Pieni apufunktio: tekee fetchin bearer-headerilla; 401 → refresh → retry kerran
async function withAuthRetry(doRequest) {
  // 1. yritys
  let r = await doRequest();
  if (r.status === 401) {
    await refreshAccessToken();
    // 2. yritys virkistetyn tokenin kanssa
    r = await doRequest();
  }
  return handleResponse(r);
}

/**
 * Luo uuden ryhmän.
 * - POST /api/group/new_group
 * - Body: { groupName: string, memberEmails: string[] } (0–5 kpl)
 */
export async function createGroup({ groupName, memberEmails = [] }) {
  // Perusklienttivalidaatio (backend saa myös validoida)
  const name = String(groupName || "").trim();
  if (!name) {
    const e = new Error("Group name is required");
    e.status = 400;
    throw e;
  }
  const emails = Array.isArray(memberEmails) ? memberEmails.slice(0, 5) : [];

  const doRequest = async () => {
    const token = getAccessToken();
    if (!token) {
      const e = new Error("Not authenticated");
      e.status = 401;
      throw e;
    }
    return fetch(`${BASE}/api/group/new_group`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ groupName: name, memberEmails: emails }),
    });
  };

  return withAuthRetry(doRequest);
}

/*
   Invitations Accept / Decline */

/**
 * Hakee kirjautuneen käyttäjän pending-kutsut (invitations).
 * - GET /api/groups/invitations?status=pending
 * - Paluu: taulukko kutsuobjekteja (requestId, groupId, groupName, requestedBy, createdAt ...)
 */
export async function getInvitations() {
  const doRequest = async () => {
    const token = getAccessToken();
    if (!token) {
      const e = new Error("Not authenticated");
      e.status = 401;
      throw e;
    }
    return fetch(`${BASE}/api/groups/invitations?status=pending`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return withAuthRetry(doRequest);
}

/**
 * Hyväksyy kutsun (Accept).
 * - POST /api/requests/:requestId/accept
 */
export async function acceptInvitation(requestId) {
  const id = String(requestId || "").trim();
  if (!id) {
    const e = new Error("Missing requestId");
    e.status = 400;
    throw e;
  }

  const doRequest = async () => {
    const token = getAccessToken();
    if (!token) {
      const e = new Error("Not authenticated");
      e.status = 401;
      throw e;
    }
    return fetch(`${BASE}/api/requests/${encodeURIComponent(id)}/accept`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return withAuthRetry(doRequest);
}

/**
 * Hylkää kutsun (Decline).
 * - POST /api/requests/:requestId/reject
 * - Paluu: { ok: true } tms.
 */
export async function rejectInvitation(requestId) {
  const id = String(requestId || "").trim();
  if (!id) {
    const e = new Error("Missing requestId");
    e.status = 400;
    throw e;
  }

  const doRequest = async () => {
    const token = getAccessToken();
    if (!token) {
      const e = new Error("Not authenticated");
      e.status = 401;
      throw e;
    }
    return fetch(`${BASE}/api/requests/${encodeURIComponent(id)}/reject`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return withAuthRetry(doRequest);
}

/* Alla stubit myöhempiä ominaisuuksia varten. Ne eivät tee vielä mitään, mutta
   pidetään nimipinnat olemassa, jotta komponentit voivat importata nämä jo nyt. */

export async function getMyGroups() {
  // TODO: toteuta kun backend-GET on valmis
  return [];
}

export async function getAllGroups() {
  // TODO: toteuta kun backend-GET on valmis
  return [];
}

export async function getMembers(_groupId) {
  // TODO: toteuta kun backend-GET on valmis
  return [];
}

export async function sendJoinRequest(_groupId) {
  // TODO: toteuta kun backend-POST on valmis
  const e = new Error("Not implemented: sendJoinRequest");
  e.status = 501;
  throw e;
}

export async function leaveGroup(_groupId) {
  // TODO: toteuta kun backend-POST on valmis
  const e = new Error("Not implemented: leaveGroup");
  e.status = 501;
  throw e;
}

export async function deleteGroup(_groupId) {
  // TODO: toteuta kun backend-DELETE on valmis
  const e = new Error("Not implemented: deleteGroup");
  e.status = 501;
  throw e;
}

export async function removeMember(_groupId, _memberId) {
  // TODO: toteuta kun backend-DELETE on valmis
  const e = new Error("Not implemented: removeMember");
  e.status = 501;
  throw e;
}
