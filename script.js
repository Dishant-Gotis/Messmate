// Mess list (from your PDF, with approximate lat/lng for Nigdi/Akurdi)
const messes = [
  {
    name: "Ashirvad Lunch Home",
    type: "Veg",
    price: 80,
    rating: 4.2,
    area: "Akurdi Railway Station Rd, Nigdi",
    phone: "09922509141",
    lat: 18.648, lng: 73.771,
    today: ["Full Thali ₹80", "Half Thali ₹60"]
  },
  {
    name: "Atithi Lunch Home",
    type: "Veg",
    price: 80,
    rating: 4.0,
    area: "Sector 26, Pradhikaran, Nigdi",
    phone: "8459366781",
    lat: 18.651, lng: 73.769,
    today: ["Full Thali ₹80", "Half Thali ₹60"]
  },
  {
    name: "AWONE",
    type: "Veg",
    price: 80,
    rating: 3.9,
    area: "Bhakti Shakti Chowk, Nigdi",
    phone: "",
    lat: 18.659, lng: 73.771,
    today: ["Full Thali ₹80", "Half Thali ₹60"]
  },
  {
    name: "Shree Swami Samarth Bhojanalaya",
    type: "Veg",
    price: 100,
    rating: 4.1,
    area: "Vaishnavi Devi Mandir, Akurdi",
    phone: "7263824548",
    lat: 18.647, lng: 73.775,
    today: ["Full Thali ₹100"]
  }
];


const listEl = document.getElementById("messList");
const mapFrame = document.getElementById("mapFrame");
const openInMapsBtn = document.getElementById("openInMaps");
const walkBtn = document.getElementById("directionsWalk");
const driveBtn = document.getElementById("directionsDrive");


function renderCard(m){
  return `
    <article class="card" data-name="${m.name}">
      <h3>${m.name}</h3>
      <div class="badges">
        <span class="badge star">⭐ ${m.rating}</span>
        <span class="badge veg">${m.type}</span>
        <span class="badge price">₹${m.price} Thali</span>
      </div>
      <p><b>Today:</b> ${m.today.join(", ")}</p>
      <p class="muted">${m.area}</p>
      <div class="actions">
        <button class="btn">View on Map</button>
        ${m.phone ? `<a class="btn-outline" href="tel:${m.phone}">📞 Call</a>` : ""}
      </div>
    </article>
  `;
}
function render(arr){ listEl.innerHTML = arr.map(renderCard).join(""); }


function setMapFor(m){
  if(!m.lat || !m.lng) return;
  const q = encodeURIComponent(`${m.name} ${m.lat},${m.lng}`);
  mapFrame.src = `https://www.google.com/maps?q=${q}&output=embed`;
  [openInMapsBtn,walkBtn,driveBtn].forEach(b=>b.disabled=false);
  openInMapsBtn.onclick=()=>window.open(`https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lng}`,'_blank');
  walkBtn.onclick=()=>window.open(`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}&travelmode=walking`,'_blank');
  driveBtn.onclick=()=>window.open(`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}&travelmode=driving`,'_blank');
  document.querySelectorAll(".card").forEach(c=>c.classList.remove("active"));
  document.querySelector(`.card[data-name="${CSS.escape(m.name)}"]`)?.classList.add("active");
}


listEl.addEventListener("click",e=>{
  const card=e.target.closest(".card");
  if(card){ const m=messes.find(x=>x.name===card.dataset.name); if(m) setMapFor(m); }
});


// Initial render
render(messes);
if(messes.length) setMapFor(messes[0]);



