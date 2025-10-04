// MessMate - Clean JavaScript Application (No External Dependencies)

// Application State
const state = {
  messes: [],
  userLocation: null,
  loading: false
};

// Sample Data
const SAMPLE_MESSES = [
  {
    id: '1',
    name: 'Shivneri Veg Mess',
    type: 'veg',
    pricePerMeal: 100,
    rating: 4.6,
    todaysMenu: ['Dal Tadka', 'Paneer Butter Masala', 'Jeera Rice', 'Phulka'],
    address: 'Kothrud, Pune, Maharashtra',
    coordinates: { lat: 18.5074, lng: 73.8077 },
    phone: '+919999000001'
  },
  {
    id: '2',
    name: 'Spice Route Non-Veg',
    type: 'non-veg',
    pricePerMeal: 180,
    rating: 4.3,
    todaysMenu: ['Chicken Curry', 'Egg Masala', 'Jeera Rice', 'Paratha'],
    address: 'Hadapsar, Pune, Maharashtra',
    coordinates: { lat: 18.5089, lng: 73.9260 },
    phone: '+919999000002'
  },
  {
    id: '3',
    name: 'Balanced Bite',
    type: 'both',
    pricePerMeal: 140,
    rating: 4.5,
    todaysMenu: ['Rajma', 'Paneer Bhurji', 'Chicken Curry', 'Roti'],
    address: 'Viman Nagar, Pune, Maharashtra',
    coordinates: { lat: 18.5679, lng: 73.9143 },
    phone: '+919999000003'
  },
  {
    id: '4',
    name: 'Pune Tiffin Center',
    type: 'veg',
    pricePerMeal: 90,
    rating: 4.0,
    todaysMenu: ['Sambar', 'Idli', 'Upma', 'Dosa'],
    address: 'Shivajinagar, Pune, Maharashtra',
    coordinates: { lat: 18.5308, lng: 73.8470 },
    phone: '+919999000004'
  },
  {
    id: '5',
    name: 'Deccan Delight',
    type: 'both',
    pricePerMeal: 150,
    rating: 4.7,
    todaysMenu: ['Veg Thali', 'Fish Curry', 'Rice', 'Chapati'],
    address: 'Deccan Gymkhana, Pune, Maharashtra',
    coordinates: { lat: 18.5167, lng: 73.8415 },
    phone: '+919999000005'
  },
  {
    id: '6',
    name: 'FC Road Non-Veg House',
    type: 'non-veg',
    pricePerMeal: 170,
    rating: 4.2,
    todaysMenu: ['Mutton Curry', 'Egg Curry', 'Rice', 'Bhakri'],
    address: 'FC Road, Pune, Maharashtra',
    coordinates: { lat: 18.5286, lng: 73.8446 },
    phone: '+919999000006'
  },
  {
    id: '7',
    name: 'Magarpatta Meals',
    type: 'both',
    pricePerMeal: 130,
    rating: 4.4,
    todaysMenu: ['Dal Fry', 'Chicken Biryani', 'Salad', 'Roti'],
    address: 'Magarpatta, Pune, Maharashtra',
    coordinates: { lat: 18.5193, lng: 73.9312 },
    phone: '+919999000007'
  },
  {
    id: '8',
    name: 'Baner Bhukkad',
    type: 'veg',
    pricePerMeal: 110,
    rating: 3.9,
    todaysMenu: ['Chole', 'Paneer Tikka', 'Rice', 'Naan'],
    address: 'Baner, Pune, Maharashtra',
    coordinates: { lat: 18.5590, lng: 73.7868 },
    phone: '+919999000008'
  },
  {
    id: '9',
    name: 'Kalyani Curry Club',
    type: 'both',
    pricePerMeal: 160,
    rating: 4.8,
    todaysMenu: ['Paneer Kadai', 'Chicken Tikka', 'Dal Makhani', 'Roti'],
    address: 'Kalyani Nagar, Pune, Maharashtra',
    coordinates: { lat: 18.5516, lng: 73.9010 },
    phone: '+919999000009'
  },
  {
    id: '10',
    name: 'Wakad Zaika',
    type: 'non-veg',
    pricePerMeal: 150,
    rating: 3.8,
    todaysMenu: ['Chicken Thali', 'Egg Bhurji', 'Rice', 'Chapati'],
    address: 'Wakad, Pune, Maharashtra',
    coordinates: { lat: 18.5980, lng: 73.7707 },
    phone: '+919999000010'
  }
];

// Utility Functions
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Distance calculation
function toRad(value) {
  return (value * Math.PI) / 180;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some(v => v == null || isNaN(v))) return null;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// External Actions
function openMap(lat, lng) {
  window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
}

function makeCall(phoneNumber) {
  window.location.href = `tel:${phoneNumber}`;
}

// Rendering Functions
function renderMessCards(messes) {
  const loadingGrid = document.getElementById('loading-grid');
  const messGrid = document.getElementById('mess-grid');
  const emptyState = document.getElementById('empty-state');
  
  // Hide loading
  loadingGrid.classList.add('hidden');
  
  if (!messes.length) {
    messGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  messGrid.classList.remove('hidden');
  messGrid.innerHTML = '';
  
  messes.forEach(mess => {
    const distance = state.userLocation && mess.coordinates 
      ? calculateDistance(
          state.userLocation.lat, 
          state.userLocation.lng, 
          mess.coordinates.lat, 
          mess.coordinates.lng
        )
      : null;
    
    const badgeClass = mess.type === 'veg' ? 'veg' : 
                      mess.type === 'non-veg' ? 'non-veg' : 'both';
    
    const card = document.createElement('div');
    card.className = 'card mess-card';
    card.innerHTML = `
      <div class="mess-header">
        <h3 class="mess-name">${escapeHtml(mess.name)}</h3>
        <div class="rating">${Number(mess.rating).toFixed(1)} ⭐</div>
      </div>
      <div class="pill-row">
        <span class="badge ${badgeClass}">${mess.type.replace('-', ' ').toUpperCase()}</span>
        <span class="badge" style="background:var(--primary-light);color:var(--primary);border:1px solid var(--primary);">₹${Number(mess.pricePerMeal).toFixed(0)}</span>
        ${distance ? `<span class="badge" style="background:var(--info-light);color:var(--info);border:1px solid var(--info);">${distance.toFixed(1)} km</span>` : ''}
      </div>
      <div class="menu"><strong>Today's Menu:</strong> ${mess.todaysMenu.map(item => escapeHtml(item)).join(', ')}</div>
      <div class="muted">${escapeHtml(mess.address)}</div>
      <div class="actions">
        <button class="btn ghost small" onclick="openMap(${mess.coordinates.lat}, ${mess.coordinates.lng})" ${mess.coordinates ? '' : 'disabled'}>
          📍 View on Map
        </button>
        <button class="btn small" onclick="makeCall('${mess.phone}')">
          📞 Call
        </button>
      </div>
    `;
    
    messGrid.appendChild(card);
  });
}

// Filtering and Sorting
function applyFiltersAndSort() {
  const activeFilter = document.querySelector('.filters [data-filter].active')?.dataset.filter || 'all';
  const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
  const sortOption = document.getElementById('sort-select').value;
  
  let filteredMesses = [...state.messes];
  
  // Apply type filter
  if (activeFilter !== 'all') {
    filteredMesses = filteredMesses.filter(mess => mess.type === activeFilter);
  }
  
  // Apply search filter
  if (searchQuery) {
    filteredMesses = filteredMesses.filter(mess => {
      const searchableText = [
        mess.name,
        mess.address,
        ...mess.todaysMenu
      ].join(' ').toLowerCase();
      return searchableText.includes(searchQuery);
    });
  }
  
  // Calculate distances and sort
  filteredMesses = filteredMesses.map(mess => {
    const distance = state.userLocation && mess.coordinates
      ? calculateDistance(
          state.userLocation.lat,
          state.userLocation.lng,
          mess.coordinates.lat,
          mess.coordinates.lng
        )
      : null;
    return { ...mess, _distance: distance };
  });
  
  // Apply sorting
  switch (sortOption) {
    case 'distance':
      filteredMesses.sort((a, b) => (a._distance || Infinity) - (b._distance || Infinity));
      break;
    case 'rating':
      filteredMesses.sort((a, b) => Number(b.rating) - Number(a.rating));
      break;
    case 'price-asc':
      filteredMesses.sort((a, b) => Number(a.pricePerMeal) - Number(b.pricePerMeal));
      break;
    case 'price-desc':
      filteredMesses.sort((a, b) => Number(b.pricePerMeal) - Number(a.pricePerMeal));
      break;
  }
  
  renderMessCards(filteredMesses);
}

// Geolocation
function requestUserLocation() {
  if (!('geolocation' in navigator)) {
    showToast('Geolocation is not supported by this browser.', 'error');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      state.userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      showToast('Location detected! Distance sorting is now available.', 'success');
      applyFiltersAndSort();
    },
    (error) => {
      console.warn('Geolocation error:', error);
      let errorMessage = 'Location access denied.';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Distance sorting is disabled.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
      }
      showToast(errorMessage, 'error');
      // Continue without location
      applyFiltersAndSort();
    },
    {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 300000 // 5 minutes
    }
  );
}

// Data Loading
function loadMesses() {
  state.loading = true;
  
  // Simulate loading delay
  setTimeout(() => {
    state.messes = SAMPLE_MESSES;
    state.loading = false;
    applyFiltersAndSort();
    showToast('Loaded 10 local messes successfully!', 'success');
  }, 1000);
}

// Event Listeners
function initializeEventListeners() {
  // Filter buttons
  document.querySelectorAll('.filters [data-filter]').forEach(button => {
    button.addEventListener('click', (e) => {
      // Remove active class from all filter buttons
      document.querySelectorAll('.filters [data-filter]').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Add active class to clicked button
      e.target.classList.add('active');
      
      // Apply filters
      applyFiltersAndSort();
    });
  });
  
  // Search input
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', applyFiltersAndSort);
  
  // Sort dropdown
  const sortSelect = document.getElementById('sort-select');
  sortSelect.addEventListener('change', applyFiltersAndSort);
}

// Application Initialization
function initializeApp() {
  console.log('🚀 MessMate Application Starting...');
  
  // Initialize event listeners
  initializeEventListeners();
  
  // Load data
  loadMesses();
  
  // Request user location
  requestUserLocation();
  
  console.log('✅ MessMate Application Initialized');
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);