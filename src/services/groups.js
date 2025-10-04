import { refreshAccessToken } from "./refreshToken.js";

const BASE = import.meta.env.VITE_API_URL;

export const GROUP_MAX_INVITES = 20;

// Yhtenäinen vastauskäsittely ilman modernia syntaksia
async function handleResponse(r) {
  var data = null;
  try {
    data = await r.json();
  } catch (e) {
    // ei bodya -> data null
  }
  if (!r.ok) {
    var msg = "Request failed";
    if (data && data.message) msg = data.message;
    else if (data && data.err && data.err.message) msg = data.err.message;
    else if (r.statusText) msg = r.statusText;
    var e2 = new Error(msg);
    e2.status = r.status;
    e2.data = data;
    throw e2;
  }
  return data;
}

// Hakee access tokenin sessionStoragesta
function getAccessToken() {
  try {
    var raw = sessionStorage.getItem("user");
    if (!raw) return null;
    var u = JSON.parse(raw);
    return u && u.accessToken ? u.accessToken : null;
  } catch (e) {
    return null;
  }
}

// Pieni apuri: aja pyyntö; jos tulee 401, haetaan uusi token ja yritetään kerran uudestaan
async function withAuthRetry(doRequest) {
  var r = await doRequest();
  if (r.status === 401) {
    await refreshAccessToken();
    r = await doRequest();
  }
  return handleResponse(r);
}


/**
 * Luo uuden ryhmän.
 * - POST /api/group/new_group
 * - Body: { groupName: string, memberEmails: string[] } (0–GROUP_MAX_INVITES kpl)
 */
export async function createGroup(params) {
  var groupName = params ? params.groupName : "";
  var memberEmails = params && Array.isArray(params.memberEmails) ? params.memberEmails : [];
  var name = String(groupName || "").trim();
  if (!name) {
    var e = new Error("Group name is required");
    e.status = 400;
    throw e;
  }

  var emails = memberEmails.slice(0, GROUP_MAX_INVITES);

  var doRequest = async function () {
    var token = getAccessToken();
    if (!token) {
      var e3 = new Error("Not authenticated");
      e3.status = 401;
      throw e3;
    }
    return fetch(BASE + "/api/group/new_group", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ groupName: name, memberEmails: emails }),
    });
  };

  return withAuthRetry(doRequest);
}

/*
 Invitations (Accept / Decline) – backin valmiutta odottavat
 */

export async function getInvitations() {
  var doRequest = async function () {
    var token = getAccessToken();
    if (!token) {
      var e = new Error("Not authenticated");
      e.status = 401;
      throw e;
    }
    return fetch(BASE + "/api/groups/invitations?status=pending", {
      headers: { Authorization: "Bearer " + token },
    });
  };
  return withAuthRetry(doRequest);
}

export async function acceptInvitation(requestId) {
  var id = String(requestId || "").trim();
  if (!id) {
    var e = new Error("Missing requestId");
    e.status = 400;
    throw e;
  }
  var doRequest = async function () {
    var token = getAccessToken();
    if (!token) {
      var e2 = new Error("Not authenticated");
      e2.status = 401;
      throw e2;
    }
    return fetch(BASE + "/api/requests/" + encodeURIComponent(id) + "/accept", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
    });
  };
  return withAuthRetry(doRequest);
}

export async function rejectInvitation(requestId) {
  var id = String(requestId || "").trim();
  if (!id) {
    var e = new Error("Missing requestId");
    e.status = 400;
    throw e;
  }
  var doRequest = async function () {
    var token = getAccessToken();
    if (!token) {
      var e2 = new Error("Not authenticated");
      e2.status = 401;
      throw e2;
    }
    return fetch(BASE + "/api/requests/" + encodeURIComponent(id) + "/reject", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
    });
  };
  return withAuthRetry(doRequest);
}

/*
 My groups, All groups, Send join request
 */

/**
 * Palauttaa kirjautuneen käyttäjän ryhmät.
 * - GET /api/group/get_by_user (Authorization vaaditaan)
 */
export async function getMyGroups() {
  var doRequest = async function () {
    var token = getAccessToken();
    if (!token) {
      var e = new Error("Not authenticated");
      e.status = 401;
      throw e;
    }
    console.log(token)
    const res = await fetch(BASE + "/api/group/get_by_user", {
      headers: { Authorization: "Bearer " + token },
      credentials: "include"
    });
    console.log(res)
    return res
  };
  return withAuthRetry(doRequest);
}

/**
 * Palauttaa kaikki ryhmät ja jäsenmäärät.
 * - GET /api/group/get_all (ei auth-vaatimusta reitissä – lisätään header silti tarvittaessa)
 */
export async function getAllGroups() {
  // Tehdään ilman authia, koska reitti ei sitä vaadi
  var r = await fetch(BASE + "/api/group/get_all");
  return handleResponse(r);
}

/**
 * Lähettää liittymispyynnön ryhmään.
 * - POST /api/group/send_join_request
 * - Body: { groupId: number }
 */
export async function sendJoinRequest(groupId) {
  var id = Number(groupId);
  if (!id || isNaN(id)) {
    var e = new Error("Invalid groupId");
    e.status = 400;
    throw e;
  }
  var doRequest = async function () {
    var token = getAccessToken();
    if (!token) {
      var e2 = new Error("Not authenticated");
      e2.status = 401;
      throw e2;
    }
    return fetch(BASE + "/api/group/send_join_request", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ groupId: id }),
    });
  };
  return withAuthRetry(doRequest);
}