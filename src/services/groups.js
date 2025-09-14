// Ryhmätoimintojen palvelu (tyhjä). Laitetaan backend myöhemmin.

export async function getGroups() {
  return []; 
}

export async function addToGroup(_groupId, _item) {
  return { ok: false };
}
