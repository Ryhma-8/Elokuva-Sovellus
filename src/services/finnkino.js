export function formatFinnkinoDate(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

async function fetchXML(url) {
  const res = await fetch(url, { headers: { accept: "application/xml" } });
  if (!res.ok) throw new Error(`Haku epäonnistui: ${res.status}`);
  return await res.text();
}

// Parsijat
function parseAreas(xml) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const nodes = [...doc.getElementsByTagName("TheatreArea")];
  return nodes
    .map((n) => ({
      id: n.getElementsByTagName("ID")[0]?.textContent?.trim() ?? "",
      name: n.getElementsByTagName("Name")[0]?.textContent?.trim() ?? "",
    }))
    .filter((a) => a.id && a.name && !/valitse/i.test(a.name));
}

function parseSchedule(xml) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const showNodes = [...doc.getElementsByTagName("Show")];

  const shows = showNodes.map((n) => ({
    id:
      n.getElementsByTagName("ID")[0]?.textContent?.trim() ??
      n.getElementsByTagName("dttmShowStart")[0]?.textContent?.trim() ??
      Math.random().toString(36).slice(2),
    title: n.getElementsByTagName("Title")[0]?.textContent ?? "",
    theatre: n.getElementsByTagName("Theatre")[0]?.textContent ?? "",
    auditorium:
      n.getElementsByTagName("TheatreAuditorium")[0]?.textContent ?? null,
    start: n.getElementsByTagName("dttmShowStart")[0]?.textContent ?? "",
    image:
      n.getElementsByTagName("EventSmallImagePortrait")[0]?.textContent ??
      null,
  }));

  // nouseva aikajärjestys
  shows.sort((a, b) => new Date(a.start) - new Date(b.start));
  return shows;
}

// Uudelleen käytettävät funktiot
export async function getAreas() {
  const xml = await fetchXML("https://www.finnkino.fi/xml/TheatreAreas/");
  return parseAreas(xml);
}

export async function getSchedule({ area, date }) {
  const url = `https://www.finnkino.fi/xml/Schedule/?area=${encodeURIComponent(
    area
  )}&dt=${encodeURIComponent(date)}&nrOfDays=1`;
  const xml = await fetchXML(url);
  return parseSchedule(xml);
}
