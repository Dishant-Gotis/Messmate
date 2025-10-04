// MessMate main script (Firebase-free demo mode)

// Admin credentials (not used in demo mode)
const ADMIN_EMAIL = 'dishantgotisdg9881@gmail.com';
const ADMIN_PASSWORD = 'iamadmin';

// Basic state
const state = {
  user: null,
  role: null, // 'admin' | 'student'
  messes: [],
  students: [],
  userLocation: null,
  unsub: { messes: null, students: null },
  loading: { messes: false, students: false }
};

// Toasts
function showToast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// Modals / Confirm
function openModal({ title = '', body = '', actions = [] }) {
  const overlay = document.getElementById('modal-overlay');
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-header">
        <strong>${title}</strong>
        <button class="btn ghost small" id="modal-close">✖</button>
      </div>
      <div class="modal-body">${body}</div>
      <div class="modal-footer">
        ${actions.map((a, i) => `<button class="btn ${a.class || ''}" data-i="${i}">${a.label}</button>`).join('')}
      </div>
    </div>`;
  overlay.classList.add('show');
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  document.getElementById('modal-close').onclick = closeModal;
  const buttons = overlay.querySelectorAll('.modal-footer .btn');
  buttons.forEach(btn => btn.addEventListener('click', () => {
    const i = +btn.getAttribute('data-i');
    const action = actions[i];
    if (action && action.onClick) action.onClick();
  }));
  document.addEventListener('keydown', escCloseOnce);
}
function escCloseOnce(e){ if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escCloseOnce);} }
function closeModal(){ const overlay = document.getElementById('modal-overlay'); overlay.classList.remove('show'); overlay.innerHTML = ''; }
function confirmDialog(message, onYes){
  openModal({
    title: 'Please Confirm',
    body: `<p>${message}</p>`,
    actions: [
      { label: 'Cancel', class: 'ghost', onClick: closeModal },
      { label: 'Yes, Confirm', class: 'error', onClick: () => { closeModal(); onYes && onYes(); } }
    ]
  });
}

// Navbar
function updateNavbar(){
  const navUser = document.getElementById('nav-user');
  const btnLogout = document.getElementById('btn-logout');
  if (state.user) {
    navUser.textContent = `${state.user.email} ${state.role === 'admin' ? '(Admin)' : ''}`;
    btnLogout.classList.remove('hidden');
  } else {
    navUser.textContent = '';
    btnLogout.classList.add('hidden');
  }
}

function showView(view){
  document.getElementById('auth-view').classList.add('hidden');
  document.getElementById('student-view').classList.add('hidden');
  document.getElementById('admin-view').classList.add('hidden');
  if (view === 'auth') document.getElementById('auth-view').classList.remove('hidden');
  if (view === 'student') document.getElementById('student-view').classList.remove('hidden');
  if (view === 'admin') document.getElementById('admin-view').classList.remove('hidden');
}

// Auth stubs (Firebase removed)
async function login(){ showToast('Authentication is disabled in this build.', 'info'); }
async function register(){ showToast('Registration is disabled in this build.', 'info'); }
function logout(){ showToast('Auth is disabled in this build.'); }
function isAdmin(email){ return email === ADMIN_EMAIL; }
async function loginWithGoogle(){ showToast('Google Sign-In is disabled in this build.', 'info'); }
async function ensureStudentProfile(){ return; }

// Demo data
const SAMPLE_MESSES = [
  { name:'Shivneri Veg Mess', type:'veg', pricePerMeal:100, rating:4.6, todaysMenu:['Dal Tadka','Paneer Butter Masala','Jeera Rice','Phulka'], address:'Kothrud, Pune', coordinates:{lat:18.5074,lng:73.8077}, phone:'+919999000001' },
  { name:'Spice Route Non-Veg', type:'non-veg', pricePerMeal:180, rating:4.3, todaysMenu:['Chicken Curry','Egg Masala','Jeera Rice','Paratha'], address:'Hadapsar, Pune', coordinates:{lat:18.5089,lng:73.9260}, phone:'+919999000002' },
  { name:'Balanced Bite', type:'both', pricePerMeal:140, rating:4.5, todaysMenu:['Rajma','Paneer Bhurji','Chicken Curry','Roti'], address:'Viman Nagar, Pune', coordinates:{lat:18.5679,lng:73.9143}, phone:'+919999000003' },
  { name:'Pune Tiffin Center', type:'veg', pricePerMeal:90, rating:4.0, todaysMenu:['Sambar','Idli','Upma','Dosa'], address:'Shivajinagar, Pune', coordinates:{lat:18.5308,lng:73.8470}, phone:'+919999000004' },
  { name:'Deccan Delight', type:'both', pricePerMeal:150, rating:4.7, todaysMenu:['Veg Thali','Fish Curry','Rice','Chapati'], address:'Deccan Gymkhana, Pune', coordinates:{lat:18.5167,lng:73.8415}, phone:'+919999000005' },
  { name:'FC Road Non-Veg House', type:'non-veg', pricePerMeal:170, rating:4.2, todaysMenu:['Mutton Curry','Egg Curry','Rice','Bhakri'], address:'FC Road, Pune', coordinates:{lat:18.5286,lng:73.8446}, phone:'+919999000006' },
  { name:'Magarpatta Meals', type:'both', pricePerMeal:130, rating:4.4, todaysMenu:['Dal Fry','Chicken Biryani','Salad','Roti'], address:'Magarpatta, Pune', coordinates:{lat:18.5193,lng:73.9312}, phone:'+919999000007' },
  { name:'Baner Bhukkad', type:'veg', pricePerMeal:110, rating:3.9, todaysMenu:['Chole','Paneer Tikka','Rice','Naan'], address:'Baner, Pune', coordinates:{lat:18.5590,lng:73.7868}, phone:'+919999000008' },
  { name:'Kalyani Curry Club', type:'both', pricePerMeal:160, rating:4.8, todaysMenu:['Paneer Kadai','Chicken Tikka','Dal Makhani','Roti'], address:'Kalyani Nagar, Pune', coordinates:{lat:18.5516,lng:73.9010}, phone:'+919999000009' },
  { name:'Wakad Zaika', type:'non-veg', pricePerMeal:150, rating:3.8, todaysMenu:['Chicken Thali','Egg Bhurji','Rice','Chapati'], address:'Wakad, Pune', coordinates:{lat:18.5980,lng:73.7707}, phone:'+919999000010' }
];
const SAMPLE_STUDENTS = [
  ['Aarav Mehta','aarav.mehta@example.com','+919820000001','active'],
  ['Isha Kulkarni','isha.kulkarni@example.com','+919820000002','active'],
  ['Rohan Patil','rohan.patil@example.com','+919820000003','inactive'],
  ['Priya Sharma','priya.sharma@example.com','+919820000004','active'],
  ['Karan Gupta','karan.gupta@example.com','+919820000005','active'],
  ['Sneha Joshi','sneha.joshi@example.com','+919820000006','inactive'],
  ['Aditya Deshmukh','aditya.deshmukh@example.com','+919820000007','active'],
  ['Neha Singh','neha.singh@example.com','+919820000008','active'],
  ['Sahil Khan','sahil.khan@example.com','+919820000009','inactive'],
  ['Pooja Nair','pooja.nair@example.com','+919820000010','active'],
  ['Vikas Rao','vikas.rao@example.com','+919820000011','active'],
  ['Simran Kaur','simran.kaur@example.com','+919820000012','inactive'],
  ['Rahul Verma','rahul.verma@example.com','+919820000013','active'],
  ['Ananya Iyer','ananya.iyer@example.com','+919820000014','active'],
  ['Harsh Jain','harsh.jain@example.com','+919820000015','inactive']
].map(([name,email,phone,status],i)=>({ id:String(i+1), name,email,phone,address:'',status, registeredAt: Date.now() - (i+1)*8640000 }));

// Demo CRUD for messes (in-memory)
async function addMess(data){
  const item = { id: String(Date.now()), ...data };
  state.messes.unshift(item);
  renderMessTable(state.messes); renderDashboard();
  return item;
}
async function updateMess(id, data){
  const idx = state.messes.findIndex(x => x.id === id);
  if (idx >= 0) { state.messes[idx] = { ...state.messes[idx], ...data }; }
  renderMessTable(state.messes); renderDashboard();
}
async function deleteMess(id){
  state.messes = state.messes.filter(x => x.id !== id);
  renderMessTable(state.messes); renderDashboard();
}

// Students demo functions (no-op persistent storage)
async function addStudent(payload){ state.students.unshift({ id:String(Date.now()), ...payload, registeredAt: Date.now() }); renderStudentTable(state.students); renderDashboard(); }
async function updateStudent(id, payload){ const i = state.students.findIndex(x=>x.id===id); if(i>=0){ state.students[i] = { ...state.students[i], ...payload }; } renderStudentTable(state.students); renderDashboard(); }
async function deleteStudent(id){ state.students = state.students.filter(x=>x.id!==id); renderStudentTable(state.students); renderDashboard(); }
async function fetchStudentsOnce(){ return state.students; }

async function fetchMessesOnce(){ return state.messes; }

function seedSampleData(){
  confirmDialog('Reset demo data (messes and students)?', () => {
    state.messes = JSON.parse(JSON.stringify(SAMPLE_MESSES.map((m,i)=>({ id:String(i+1), ...m }))));
    state.students = JSON.parse(JSON.stringify(SAMPLE_STUDENTS));
    renderMessTable(state.messes);
    renderStudentTable(state.students);
    renderDashboard();
    showToast('Sample data loaded', 'success');
  });
}

// Distance
function toRad(v){ return v * Math.PI / 180; }
function calculateDistance(lat1, lon1, lat2, lon2){
  if ([lat1, lon1, lat2, lon2].some(v => v == null || isNaN(v))) return null;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function openMap(lat, lng) { window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank'); }
function makeCall(phoneNumber) { window.location.href = `tel:${phoneNumber}`; }

// Rendering: Student
function renderMessCards(messes){
  const grid = document.getElementById('mess-grid');
  grid.innerHTML = '';
  if (!messes.length){
    document.getElementById('student-empty').classList.remove('hidden');
    grid.classList.add('hidden');
    return;
  }
  document.getElementById('student-empty').classList.add('hidden');
  grid.classList.remove('hidden');

  messes.forEach(m => {
    const dist = state.userLocation && m.coordinates ? calculateDistance(state.userLocation.lat, state.userLocation.lng, m.coordinates.lat, m.coordinates.lng) : null;
    const badgeClass = m.type === 'veg' ? 'veg' : m.type === 'non-veg' ? 'non-veg' : 'both';
    const el = document.createElement('div');
    el.className = 'card mess-card';
    el.innerHTML = `
      <div class="mess-header">
        <h3 class="mess-name">${escapeHtml(m.name)}</h3>
        <div class="rating">${Number(m.rating).toFixed(1)} ⭐</div>
      </div>
      <div class="pill-row">
        <span class="badge ${badgeClass}">${m.type.replace('-', ' ').toUpperCase()}</span>
        <span class="badge" style="background:#EEF2FF;color:#3730A3;border:1px solid #C7D2FE;">₹ ${Number(m.pricePerMeal).toFixed(0)}</span>
        ${dist != null ? `<span class="badge" style="background:#ECFEFF;color:#155E75;border:1px solid #A5F3FC;">${dist.toFixed(2)} km</span>` : ''}
      </div>
      <div class="menu"><strong>Today's Menu:</strong> ${(m.todaysMenu||[]).map(escapeHtml).join(', ')}</div>
      <div class="muted">${escapeHtml(m.address||'')}</div>
      <div class="actions">
        <button class="btn ghost small" ${m.coordinates ? '' : 'disabled'} onclick="openMap(${m.coordinates?.lat||0}, ${m.coordinates?.lng||0})">View on Map</button>
        <button class="btn small" onclick="makeCall('${m.phone||''}')">Call</button>
      </div>
    `;
    grid.appendChild(el);
  });
}

function applyStudentQuery(){
  const filter = document.querySelector('.filters [data-filter].active')?.dataset.filter || 'all';
  const q = (document.getElementById('search-input').value || '').toLowerCase();
  const sort = document.getElementById('sort-select').value;

  let arr = [...state.messes];
  if (filter !== 'all') arr = arr.filter(m => m.type === filter);
  if (q) arr = arr.filter(m => (m.name + ' ' + (m.address||'')).toLowerCase().includes(q) || (m.todaysMenu||[]).join(',').toLowerCase().includes(q));

  arr = arr.map(m => {
    const dist = state.userLocation && m.coordinates ? calculateDistance(state.userLocation.lat, state.userLocation.lng, m.coordinates.lat, m.coordinates.lng) : null;
    return { ...m, _dist: dist };
  });

  if (sort === 'distance') arr.sort((a,b) => (a._dist ?? Infinity) - (b._dist ?? Infinity));
  if (sort === 'rating') arr.sort((a,b) => Number(b.rating) - Number(a.rating));
  if (sort === 'price-asc') arr.sort((a,b) => Number(a.pricePerMeal) - Number(b.pricePerMeal));
  if (sort === 'price-desc') arr.sort((a,b) => Number(b.pricePerMeal) - Number(a.pricePerMeal));

  renderMessCards(arr);
}

// Admin rendering
function renderMessTable(messes){
  const tbody = document.getElementById('messes-tbody');
  tbody.innerHTML = '';
  const q = (document.getElementById('messes-search').value||'').toLowerCase();
  messes.filter(m => !q || m.name.toLowerCase().includes(q)).forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(m.name)}</td>
      <td>${badgeHtml(m.type)}</td>
      <td>₹ ${Number(m.pricePerMeal).toFixed(0)}</td>
      <td>${Number(m.rating).toFixed(1)} ⭐</td>
      <td>${escapeHtml(m.phone||'')}</td>
      <td>
        <div class="table-actions">
          <button class="btn ghost small" data-edit="${m.id}">✏️ Edit</button>
          <button class="btn error small" data-delete="${m.id}">🗑️ Delete</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openMessModal('edit', state.messes.find(x => x.id === btn.dataset.edit))));
  tbody.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => {
    const m = state.messes.find(x => x.id === btn.dataset.delete);
    confirmDialog(`Are you sure you want to delete "${m.name}"?`, async () => {
      try { await deleteMess(m.id); showToast('Mess deleted', 'success'); } catch (e) { showToast(e.message, 'error'); }
    });
  }));
}

function renderStudentTable(students){
  const tbody = document.getElementById('students-tbody');
  tbody.innerHTML = '';
  const q = (document.getElementById('students-search').value||'').toLowerCase();
  students.filter(s => !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)).forEach(s => {
    const d = new Date(s.registeredAt||Date.now()).toLocaleDateString();
    const badge = s.status === 'active' ? `<span class="badge" style="background:#ECFDF5;color:#065F46;border:1px solid #A7F3D0;">Active</span>` : `<span class="badge" style="background:#FEF2F2;color:#991B1B;border:1px solid #FECACA;">Inactive</span>`;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(s.name||'')}</td>
      <td>${escapeHtml(s.email||'')}</td>
      <td>${escapeHtml(s.phone||'')}</td>
      <td>${d}</td>
      <td>${badge}</td>
      <td>
        <div class="table-actions">
          <button class="btn ghost small" data-edit="${s.id}">✏️ Edit</button>
          <button class="btn error small" data-delete="${s.id}">🗑️ Delete</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openStudentModal('edit', state.students.find(x => x.id === btn.dataset.edit))));
  tbody.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => {
    const s = state.students.find(x => x.id === btn.dataset.delete);
    confirmDialog(`Delete student "${s.name}"?`, async () => {
      try { await deleteStudent(s.id); showToast('Student deleted', 'success'); } catch (e) { showToast(e.message, 'error'); }
    });
  }));
}

// Helpers
function badgeHtml(type){
  const cls = type === 'veg' ? 'veg' : type === 'non-veg' ? 'non-veg' : 'both';
  return `<span class="badge ${cls}">${type.replace('-', ' ').toUpperCase()}</span>`;
}
function escapeHtml(s){ return String(s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function escapeAttr(s){ return String(s??'').replace(/"/g,'&quot;'); }

// Modals wired to demo CRUD
function openMessModal(mode, data){
  const isEdit = mode === 'edit';
  const m = data || { id:String(Date.now()), name:'', type:'veg', pricePerMeal:'', rating:'', todaysMenu:'', address:'', coordinates:{lat:'', lng:''}, phone:'' };
  const body = `
    <form id="mess-form">
      <div class="field"><label class="label">Mess Name*</label><input name="name" class="input" value="${escapeAttr(m.name)}" required /></div>
      <div class="field-inline">
        <div class="field"><label class="label">Type*</label>
          <select name="type" class="select" required>
            <option value="veg" ${m.type==='veg'?'selected':''}>Veg</option>
            <option value="non-veg" ${m.type==='non-veg'?'selected':''}>Non-Veg</option>
            <option value="both" ${m.type==='both'?'selected':''}>Both</option>
          </select>
        </div>
        <div class="field"><label class="label">Price per Meal* (₹)</label><input name="pricePerMeal" type="number" min="0" class="input" value="${escapeAttr(m.pricePerMeal)}" required /></div>
      </div>
      <div class="field-inline">
        <div class="field"><label class="label">Rating* (1-5)</label><input name="rating" type="number" min="1" max="5" step="0.1" class="input" value="${escapeAttr(m.rating)}" required /></div>
        <div class="field"><label class="label">Phone Number* (+91XXXXXXXXXX)</label><input name="phone" class="input" value="${escapeAttr(m.phone)}" required /></div>
      </div>
      <div class="field"><label class="label">Today's Menu* (comma-separated)</label><textarea name="todaysMenu" class="textarea" required>${(m.todaysMenu||[]).join(', ')}</textarea></div>
      <div class="field"><label class="label">Address*</label><textarea name="address" class="textarea" required>${escapeHtml(m.address||'')}</textarea></div>
      <div class="field-inline">
        <div class="field"><label class="label">Latitude*</label><input name="lat" type="number" step="any" class="input" value="${escapeAttr(m.coordinates?.lat)}" required /></div>
        <div class="field"><label class="label">Longitude*</label><input name="lng" type="number" step="any" class="input" value="${escapeAttr(m.coordinates?.lng)}" required /></div>
      </div>
    </form>`;
  openModal({
    title: isEdit ? 'Edit Mess' : 'Add New Mess',
    body,
    actions: [
      { label: 'Cancel', class: 'ghost', onClick: closeModal },
      { label: isEdit ? 'Save Changes' : 'Add Mess', class: 'success', onClick: async () => {
          const form = document.getElementById('mess-form');
          const fd = new FormData(form);
          const phone = fd.get('phone').trim();
          if (!/^\+?\d{10,15}$/.test(phone)) { showToast('Invalid phone number', 'error'); return; }
          const data = {
            name: fd.get('name').trim(),
            type: fd.get('type'),
            pricePerMeal: Number(fd.get('pricePerMeal')),
            rating: Number(fd.get('rating')),
            todaysMenu: String(fd.get('todaysMenu')).split(',').map(s => s.trim()).filter(Boolean),
            address: fd.get('address').trim(),
            coordinates: { lat: Number(fd.get('lat')), lng: Number(fd.get('lng')) },
            phone
          };
          try {
            if (isEdit) await updateMess(m.id, data); else await addMess(data);
            showToast(isEdit ? 'Mess updated' : 'Mess added', 'success');
            closeModal();
          } catch (e){ showToast(e.message, 'error'); }
        }
      }
    ]
  });
}

function openStudentModal(mode, data){
  const isEdit = mode === 'edit';
  const s = data || { id:String(Date.now()), name:'', email:'', phone:'', address:'', status:'active', registeredAt: Date.now() };
  const body = `
    <form id="student-form">
      <div class="field-inline">
        <div class="field"><label class="label">Full Name*</label><input name="name" class="input" value="${escapeAttr(s.name)}" required /></div>
        <div class="field"><label class="label">Email*</label><input name="email" type="email" class="input" value="${escapeAttr(s.email)}" required /></div>
      </div>
      <div class="field-inline">
        <div class="field"><label class="label">Phone Number*</label><input name="phone" class="input" value="${escapeAttr(s.phone)}" required /></div>
        <div class="field"><label class="label">Status*</label>
          <select name="status" class="select">
            <option value="active" ${s.status==='active'?'selected':''}>Active</option>
            <option value="inactive" ${s.status==='inactive'?'selected':''}>Inactive</option>
          </select>
        </div>
      </div>
      <div class="field"><label class="label">Address</label><textarea name="address" class="textarea">${escapeHtml(s.address||'')}</textarea></div>
    </form>`;
  openModal({
    title: isEdit ? 'Edit Student' : 'Add New Student',
    body,
    actions: [
      { label: 'Cancel', class: 'ghost', onClick: closeModal },
      { label: isEdit ? 'Save Changes' : 'Add Student', class: 'success', onClick: async () => {
          const form = document.getElementById('student-form');
          const fd = new FormData(form);
          const phone = fd.get('phone').trim();
          if (!/^\+?\d{10,15}$/.test(phone)) { showToast('Invalid phone number', 'error'); return; }
          const payload = {
            name: fd.get('name').trim(),
            email: fd.get('email').trim(),
            phone,
            address: fd.get('address').trim(),
            status: fd.get('status')
          };
          try {
            if (isEdit) await updateStudent(s.id, payload); else await addStudent(payload);
            showToast(isEdit ? 'Student updated' : 'Student added', 'success');
            closeModal();
          } catch (e){ showToast(e.message, 'error'); }
        }
      }
    ]
  });
}

// Dashboard
function calculateStatistics(){
  const totalMesses = state.messes.length;
  const totalStudents = state.students.length;
  const avgRating = totalMesses ? (state.messes.reduce((a,b) => a + Number(b.rating||0), 0)/totalMesses) : 0;
  const popular = state.messes.slice().sort((a,b) => Number(b.rating)-Number(a.rating))[0];
  return { totalMesses, totalStudents, avgRating: avgRating.toFixed(2), popular: popular ? popular.name : '—' };
}
function renderDashboard(){
  const s = calculateStatistics();
  document.getElementById('stat-messes').textContent = s.totalMesses;
  document.getElementById('stat-students').textContent = s.totalStudents;
  document.getElementById('stat-rating').textContent = `${s.avgRating} ⭐`;
  document.getElementById('stat-popular').textContent = s.popular;
}

// CSV
function exportStudentsCsv(){
  const rows = [['Name','Email','Phone','Status','RegisteredAt']].concat(state.students.map(s => [s.name||'', s.email||'', s.phone||'', s.status||'', new Date(s.registeredAt||Date.now()).toISOString()]));
  const csv = rows.map(r => r.map(x => '"' + String(x).replace(/"/g,'""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'students.csv'; a.click(); URL.revokeObjectURL(url);
}

// Geolocation
function requestUserLocation(){
  if (!('geolocation' in navigator)) return;
  navigator.geolocation.getCurrentPosition((pos) => {
    state.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    applyStudentQuery();
  }, (err) => {
    console.warn('Geolocation denied or failed', err);
    showToast('Location permission denied. Sorting by distance disabled.', 'error');
  }, { enableHighAccuracy: true, timeout: 8000 });
}

// Initialize DOM events
document.addEventListener('DOMContentLoaded', () => {
  // Tabs (still present in DOM but auth is disabled in demo)
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  if (tabLogin && tabRegister && formLogin && formRegister){
    tabLogin.addEventListener('click', () => { tabLogin.classList.replace('ghost','secondary'); tabRegister.classList.replace('secondary','ghost'); formLogin.classList.remove('hidden'); formRegister.classList.add('hidden'); });
    tabRegister.addEventListener('click', () => { tabRegister.classList.replace('ghost','secondary'); tabLogin.classList.replace('secondary','ghost'); formRegister.classList.remove('hidden'); formLogin.classList.add('hidden'); });
  }

  // Login/Register forms (disabled in demo)
  if (formLogin) formLogin.addEventListener('submit', (e) => { e.preventDefault(); showToast('Auth disabled in demo. Use Admin page demo instead.', 'info'); });
  if (formRegister) formRegister.addEventListener('submit', (e) => { e.preventDefault(); showToast('Registration disabled in demo.', 'info'); });

  // Navbar
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', logout);
  const adminLogout = document.getElementById('admin-logout');
  if (adminLogout) adminLogout.addEventListener('click', logout);

  // Filters/search/sort
  document.querySelectorAll('.filters [data-filter]').forEach(btn => btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filters [data-filter]').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    applyStudentQuery();
  }));
  const allFilter = document.querySelector('.filters [data-filter="all"]');
  if (allFilter) allFilter.classList.add('active');
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', applyStudentQuery);
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.addEventListener('change', applyStudentQuery);

  // Admin nav
  document.querySelectorAll('.side-link[data-admin-page]').forEach(el => el.addEventListener('click', () => showAdminPage(el.dataset.adminPage)));

  // Admin actions
  const btnAddMess = document.getElementById('btn-add-mess'); if (btnAddMess) btnAddMess.addEventListener('click', () => openMessModal('add'));
  const messesSearch = document.getElementById('messes-search'); if (messesSearch) messesSearch.addEventListener('input', () => renderMessTable(state.messes));
  const btnAddStudent = document.getElementById('btn-add-student'); if (btnAddStudent) btnAddStudent.addEventListener('click', () => openStudentModal('add'));
  const studentsSearch = document.getElementById('students-search'); if (studentsSearch) studentsSearch.addEventListener('input', () => renderStudentTable(state.students));
  const btnExport = document.getElementById('btn-export-students'); if (btnExport) btnExport.addEventListener('click', exportStudentsCsv);
  const btnSeed = document.getElementById('btn-seed'); if (btnSeed) btnSeed.addEventListener('click', seedSampleData);

  // Start demo
  state.role = 'student';
  updateNavbar();
  showView('student');
  state.messes = JSON.parse(JSON.stringify(SAMPLE_MESSES.map((m,i)=>({ id:String(i+1), ...m }))));
  state.students = JSON.parse(JSON.stringify(SAMPLE_STUDENTS));
  document.getElementById('student-loading').classList.remove('hidden');
  document.getElementById('mess-grid').classList.add('hidden');
  setTimeout(() => {
    document.getElementById('student-loading').classList.add('hidden');
    document.getElementById('mess-grid').classList.remove('hidden');
    requestUserLocation();
    applyStudentQuery();
  }, 300);
});
