/* ===== DATA =====
   Coordinates come from Google Maps place listings (Good Pastry Cafe - Angeles, Azzurro Hotel,
   SM City Clark, Gogi Marami Korea Town, Clark International Airport). Edit pos:[lat,lng] to change a pin. */
const STOPS = [
  { n:1, img:"https://loremflickr.com/900/500/bus,travel?lock=11", icon:"🚌", title:"Genesis (Call Time)", time:"4:30 AM", bg:"#ffe9c9",
    info:["Call time before we leave for Clark."] },
  { n:2, img:"https://loremflickr.com/900/500/highway,bus?lock=12", icon:"🛣️", title:"Bataan to Clark", time:"5:00 – 7:00 AM", bg:"#ffe0e6",
    info:["Travel from Bataan to Clark via Genesis bus."] },
  { n:3, img:"https://loremflickr.com/900/500/pastry,croissant,cafe?lock=13", icon:"🥐☕", title:"Good Pastry Cafe", time:"7:00 – 8:30 AM", bg:"#ffe3d6", map:true,
    info:["Our first stop: Pastries"],
    link:"https://www.tiktok.com/@rhainedrops_/video/7530996688207531272?_r=1&_t=ZS-9ATqz8fBOkP",
    pos:[15.16056,120.55697] },
  { n:4, img:"https://loremflickr.com/900/500/hotel,lobby,interior?lock=14", icon:"🏨✨", title:"The Ambience (Azzurro Hotel)", time:"8:30 – 10:00 AM", bg:"#e8eefc", map:true,
    info:["Second Stop: Drinks or Appetizers"],
    link:"https://www.tiktok.com/@sismarsmanganlena/video/7655291279814774036?_r=1&_t=ZS-9ATr8RnQAIm",
    pos:[15.16370,120.59112] },
  { n:5, img:"https://loremflickr.com/900/500/bowling,archery?lock=15", icon:"🎳🏹", title:"SM City Clark – Activities", time:"10:00 – 11:30 AM", bg:"#e2f6e4", map:true,
    info:["Bowling","Archery","Other fun activities, depending on availability"],
    link:"https://www.tiktok.com/@bacanisam/video/7663080436607798536?_r=1&_t=ZS-9ATrCNXjIEX",
    pos:[15.16727,120.58011] },
  { n:6, img:"https://loremflickr.com/900/500/shopping,mall?lock=16", icon:"🛍️🛒", title:"SM City Clark – Ikot-Ikot", time:"11:30 AM – 1:00 PM", bg:"#f3e6ff",
    info:["Explore the mall, walk around, check out stores, and enjoy our free time."] },
  { n:7, img:"https://loremflickr.com/900/500/korean,bbq,grill?lock=17", icon:"🥩🔥", title:"Gogi Marami", time:"1:00 – 3:00 PM", feature:true, map:true,
    info:["Ang pinaka iniintay ni Sashie","SAMGYUPSAL! 🍖🥬🍚"],
    link:"https://www.tiktok.com/@imjasminflores/video/7684841566896131348?_r=1&_t=ZS-9ATrGcDDjDJ",
    pos:[15.16177,120.55163] },
  { n:8, img:"https://loremflickr.com/900/500/bus,road?lock=18", icon:"🚌💤", title:"Clark to Bataan", time:"3:00 – 6:00 PM", bg:"#ffe9c9",
    info:["Travel back to Bataan."], note:"Depende sa bus :)" }
];
// Clark Airport is the map's starting point (not a card)
const AIRPORT = { title:"Clark Airport", time:"Arrival in Clark (~7:00 AM)", pos:[15.19759,120.55721] };

/* ===== TIMELINE ===== */
const tl = document.getElementById("timeline");
STOPS.forEach(s => {
  const el = document.createElement("article");
  el.className = "card" + (s.feature ? " feature" : "");
  el.dataset.n = s.n;
    el.innerHTML = `
    ${s.img ? `<img class="photo" src="${s.img}" alt="${s.title}" loading="lazy" onerror="this.remove()">` : ""}
    <div class="icon">${s.icon}</div>
    <div class="body">
      <span class="time">${s.time}</span>${s.feature ? '<span class="tag">Main event</span>' : ""}
      <h3>${s.title}</h3>
      ${s.info.length > 1 ? "<ul>" + s.info.map(i => `<li>${i}</li>`).join("") + "</ul>" : `<p>${s.info[0]}</p>`}
      ${s.note ? `<div class="note">${s.note}</div>` : ""}
      ${s.link ? `<a class="btn" href="${s.link}" target="_blank" rel="noopener noreferrer">Click Me</a>` : ""}
    </div>`;
  tl.appendChild(el);
});
// Fade cards in as they scroll into view
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add("show"), io.unobserve(e.target))), { threshold: .15 });
document.querySelectorAll(".card").forEach(c => io.observe(c));

/* ===== MAP (Leaflet + OpenStreetMap) ===== */
const mapEl = document.getElementById("route-map");
if (typeof L === "undefined") {
  mapEl.innerHTML = '<p style="padding:30px;text-align:center">Map could not load. Check your internet connection and refresh the page.</p>';
  throw new Error("Leaflet failed to load");
}
const places = [AIRPORT, ...STOPS.filter(s => s.map)];
const map = L.map("route-map", { scrollWheelZoom: false }).setView(AIRPORT.pos, 14);
const tiles = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: "Tiles &copy; Esri, HERE, Garmin, OpenStreetMap contributors" }).addTo(map);
// If these tiles are blocked, switch to the standard OpenStreetMap tiles
let swapped = false;
tiles.on("tileerror", () => { if (swapped) return; swapped = true; map.removeLayer(tiles);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" }).addTo(map); });

// Numbered pins with click popups
places.forEach((p, i) => {
  const icon = L.divIcon({ className: "", html: `<div class="pin"><span>${i + 1}</span></div>`, iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -34] });
  L.marker(p.pos, { icon }).addTo(map).bindPopup(`<div class="pop"><b>${i + 1}. ${p.title}</b><br>${p.time}</div>`);
});
map.fitBounds(places.map(p => p.pos), { padding: [40, 40] });

// Bearing (degrees) between two [lat,lng] points, for the direction arrows
const bearing = (a, b) => {
  const r = Math.PI / 180, y = Math.sin((b[1]-a[1])*r) * Math.cos(b[0]*r);
  const x = Math.cos(a[0]*r)*Math.sin(b[0]*r) - Math.sin(a[0]*r)*Math.cos(b[0]*r)*Math.cos((b[1]-a[1])*r);
  return (Math.atan2(y, x) / r + 360) % 360;
};

// Draw one leg + a directional arrow at its midpoint
function drawLeg(coords) {
  L.polyline(coords, { color: "#6e1325", weight: 4, opacity: .8, dashArray: "1 9", lineCap: "round" }).addTo(map);
  const m = Math.floor(coords.length / 2), a = coords[Math.max(m - 1, 0)], b = coords[Math.min(m + 1, coords.length - 1)];
  L.marker(coords[m], { interactive: false, icon: L.divIcon({ className: "",
    html: `<div class="arrow" style="transform:rotate(${bearing(a, b) - 90}deg)">➤</div>`, iconSize: [22, 22], iconAnchor: [11, 11] }) }).addTo(map);
}

// Real road routes from OSRM's free demo server; falls back to a straight line if offline/blocked
async function route(a, b) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`;
    const j = await (await fetch(url)).json();
    return j.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
  } catch (e) { return [a, b]; }
}
(async () => {
  for (let i = 0; i < places.length - 1; i++) drawLeg(await route(places[i].pos, places[i + 1].pos));
})();

// Make sure the map sizes itself correctly once the page has fully loaded
window.addEventListener("load", () => { map.invalidateSize(); map.fitBounds(places.map(p => p.pos), { padding: [40, 40] }); });
