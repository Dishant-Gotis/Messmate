// MessMate Authentication System with Supabase
// This file handles all authentication functionality including login, signup, logout, and session management

// Supabase Configuration
// Environment variables are automatically injected by Vercel
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://faetszbcjwfosgexemhz.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZXRzemJjandmb3NnZXhlbWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODA5NjMsImV4cCI6MjA3NTE1Njk2M30.XPdnaw65T_ZclF9otchyRL-s6jRL_P4oy9wJUsloh6I';

// Production configuration
const APP_URL = import.meta.env?.VITE_APP_URL || 'https://messmate-ten.vercel.app';
const ENABLE_GOOGLE_AUTH = import.meta.env?.VITE_ENABLE_GOOGLE_AUTH !== 'false';
const ENABLE_DEMO_MODE = import.meta.env?.VITE_ENABLE_DEMO_MODE !== 'false';

// Initialize Supabase client
let supabase;
let currentUser = null;

// Initialize Supabase (only if credentials are provided)
function initializeSupabase() {
  // Check if we have Supabase credentials and the library is available
  const hasCredentials = SUPABASE_URL && SUPABASE_ANON_KEY && 
    SUPABASE_URL !== 'https://your-project-ref.supabase.co' &&
    SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (hasCredentials && window.supabase) {
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Supabase initialized successfully');
      
      // Listen for auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session);
        currentUser = session?.user || null;
        updateAuthUI();
        
        if (event === 'SIGNED_IN') {
          showToast('Welcome back! You are now signed in.', 'success');
          // Redirect to main page after successful login
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } else if (event === 'SIGNED_OUT') {
          showToast('You have been signed out.', 'info');
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error initializing Supabase:', error);
      console.warn('⚠️ Falling back to demo mode.');
      return false;
    }
  } else {
    console.warn('⚠️ Supabase credentials not configured or Supabase library not loaded. Running in demo mode.');
    return false;
  }
}

// Authentication State Management
const authState = {
  isAuthenticated: false,
  user: null,
  isLoading: false
};

// Utility Functions
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function setLoadingState(isLoading) {
  authState.isLoading = isLoading;
  
  // Update login button state
  const loginBtn = document.getElementById('login-btn');
  const googleBtn = document.getElementById('google-login-btn');
  
  if (loginBtn) {
    const btnText = loginBtn.querySelector('.btn-text');
    const btnSpinner = loginBtn.querySelector('.btn-spinner');
    
    if (isLoading) {
      loginBtn.disabled = true;
      btnText.classList.add('hidden');
      btnSpinner.classList.remove('hidden');
    } else {
      loginBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
    }
  }
  
  if (googleBtn) {
    googleBtn.disabled = isLoading;
  }
}

function updateAuthUI() {
  const isLoggedIn = currentUser !== null;
  
  // Update navbar based on auth state
  const navActions = document.querySelector('.nav-actions');
  if (navActions) {
    if (isLoggedIn) {
      // Get user display name
      let displayName = 'User';
      if (currentUser.user_metadata?.full_name) {
        displayName = currentUser.user_metadata.full_name;
      } else if (currentUser.user_metadata?.first_name) {
        displayName = currentUser.user_metadata.first_name;
      } else if (currentUser.email) {
        displayName = currentUser.email.split('@')[0];
      }
      
      // Show user menu with logout option
      navActions.innerHTML = `
        <div class="user-menu">
          <button class="btn ghost" onclick="showUserMenu()">
            👤 ${displayName}
          </button>
          <div id="user-dropdown" class="user-dropdown hidden">
            <a href="admin.html" class="dropdown-item">Admin Panel</a>
            <hr class="dropdown-divider">
            <button onclick="signOut()" class="dropdown-item logout">Sign Out</button>
          </div>
        </div>
      `;
    } else {
      // Show login button
      navActions.innerHTML = `
        <a href="login.html" class="btn ghost">Login</a>
        <a href="signup.html" class="btn">Sign Up</a>
        <a href="admin.html" class="btn ghost">Admin Panel</a>
      `;
    }
  }
}

// Authentication Functions
async function signInWithEmail(email, password) {
  console.log('🔐 Attempting sign in with email:', email);
  
  if (!supabase) {
    console.warn('❌ Supabase not initialized, checking for demo mode');
    showToast('Authentication service not configured. Please check setup.', 'error');
    return false;
  }
  
  setLoadingState(true);
  console.log('⚙️ Setting loading state to true');
  
  try {
    console.log('🚀 Calling Supabase auth.signInWithPassword');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });
    
    if (error) {
      console.error('❌ Sign in error:', error);
      showToast(error.message, 'error');
      return false;
    }
    
    console.log('✅ Supabase response received:', data);
    
    if (data.user) {
      console.log('👤 User authenticated successfully:', data.user.email);
      currentUser = data.user;
      authState.isAuthenticated = true;
      authState.user = data.user;
      updateAuthUI();
      showToast('Welcome back! You are now signed in.', 'success');
      return true;
    } else {
      console.warn('⚠️ No user in response data');
    }
    
    return false;
  } catch (error) {
    console.error('Unexpected error during sign in:', error);
    showToast('An unexpected error occurred. Please try again.', 'error');
    return false;
  } finally {
    setLoadingState(false);
  }
}

async function signUpWithEmail(email, password, userData = {}) {
  if (!supabase) {
    showToast('Authentication service not configured. Please check setup.', 'error');
    return false;
  }
  
  setLoadingState(true);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: userData
      }
    });
    
    if (error) {
      console.error('Sign up error:', error);
      showToast(error.message, 'error');
      return false;
    }
    
    if (data.user) {
      showToast('Account created! Please check your email for verification link.', 'success');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Unexpected error during sign up:', error);
    showToast('An unexpected error occurred. Please try again.', 'error');
    return false;
  } finally {
    setLoadingState(false);
  }
}

async function signInWithGoogle() {
  if (!supabase) {
    showToast('Authentication service not configured. Please check setup.', 'error');
    return false;
  }
  
  if (!ENABLE_GOOGLE_AUTH) {
    showToast('Google authentication is currently disabled.', 'info');
    return false;
  }
  
  setLoadingState(true);
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${APP_URL}/index.html`
      }
    });
    
    if (error) {
      console.error('Google sign in error:', error);
      showToast(error.message, 'error');
      setLoadingState(false);
      return false;
    }
    
    // OAuth redirect will handle the rest
    return true;
  } catch (error) {
    console.error('Unexpected error during Google sign in:', error);
    showToast('An unexpected error occurred. Please try again.', 'error');
    setLoadingState(false);
    return false;
  }
}

async function signOut() {
  if (!supabase) {
    // Demo mode - just clear local state
    currentUser = null;
    authState.isAuthenticated = false;
    authState.user = null;
    updateAuthUI();
    showToast('Signed out (demo mode)', 'info');
    return;
  }
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      showToast(error.message, 'error');
      return;
    }
    
    currentUser = null;
    authState.isAuthenticated = false;
    authState.user = null;
    updateAuthUI();
    showToast('You have been signed out successfully.', 'info');
    
    // Redirect to login page if on a protected page
    if (window.location.pathname.includes('admin.html')) {
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    }
  } catch (error) {
    console.error('Unexpected error during sign out:', error);
    showToast('An unexpected error occurred during sign out.', 'error');
  }
}

async function resetPassword(email) {
  if (!supabase) {
    showToast('Password reset not available in demo mode.', 'info');
    return false;
  }
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${APP_URL}/reset-password.html`
    });
    
    if (error) {
      console.error('Password reset error:', error);
      showToast(error.message, 'error');
      return false;
    }
    
    showToast('Password reset email sent! Check your inbox.', 'success');
    return true;
  } catch (error) {
    console.error('Unexpected error during password reset:', error);
    showToast('An unexpected error occurred. Please try again.', 'error');
    return false;
  }
}

// Form Handlers
async function handleLoginForm(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('remember-me').checked;
  
  // Basic validation
  if (!email || !password) {
    showToast('Please fill in all fields.', 'error');
    return;
  }
  
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }
  
  // Sign in with email
  const success = await signInWithEmail(email, password);
  if (success) {
    // Redirect after successful login
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
}

function handleSignupForm(event) {
  event.preventDefault();
  
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const agreeTerms = document.getElementById('agreeTerms').checked;
  
  // Basic validation
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    showToast('Please fill in all fields.', 'error');
    return;
  }
  
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }
  
  if (!isValidPassword(password)) {
    showToast('Password does not meet requirements.', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showToast('Passwords do not match.', 'error');
    return;
  }
  
  if (!agreeTerms) {
    showToast('Please agree to the terms and conditions.', 'error');
    return;
  }
  
  // Sign up with email
  const userData = {
    full_name: `${firstName} ${lastName}`,
    first_name: firstName,
    last_name: lastName
  };
  
  signUpWithEmail(email, password, userData);
}

function handleResetForm(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  
  if (!email) {
    showToast('Please enter your email address.', 'error');
    return;
  }
  
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }
  
  resetPassword(email);
}

function handleGoogleLogin() {
  signInWithGoogle();
}

// Password Requirements Validation
function validatePasswordRequirements(password) {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password)
  };
  
  // Update UI indicators
  const indicators = {
    length: document.getElementById('req-length'),
    uppercase: document.getElementById('req-uppercase'),
    lowercase: document.getElementById('req-lowercase'),
    number: document.getElementById('req-number')
  };
  
  Object.keys(requirements).forEach(req => {
    if (indicators[req]) {
      if (requirements[req]) {
        indicators[req].classList.add('valid');
        indicators[req].classList.remove('invalid');
      } else {
        indicators[req].classList.add('invalid');
        indicators[req].classList.remove('valid');
      }
    }
  });
  
  return Object.values(requirements).every(req => req);
}

// Validation Functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// User Menu Functions
function showUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
    
    // Close dropdown when clicking outside
    setTimeout(() => {
      document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest('.user-menu')) {
          dropdown.classList.add('hidden');
          document.removeEventListener('click', closeDropdown);
        }
      });
    }, 0);
  }
}

// Check Authentication Status
async function checkAuthStatus() {
  if (!supabase) {
    // Demo mode - check localStorage for demo user
    const demoUser = localStorage.getItem('messmate_demo_user');
    if (demoUser) {
      currentUser = JSON.parse(demoUser);
      authState.isAuthenticated = true;
      authState.user = currentUser;
    }
    updateAuthUI();
    return;
  }
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking auth status:', error);
      return;
    }
    
    if (session?.user) {
      currentUser = session.user;
      authState.isAuthenticated = true;
      authState.user = session.user;
    }
    
    updateAuthUI();
  } catch (error) {
    console.error('Unexpected error checking auth status:', error);
  }
}

// Demo Mode Functions (for when Supabase is not configured)
function enableDemoMode() {
  if (!ENABLE_DEMO_MODE) {
    console.log('🚫 Demo mode disabled');
    return;
  }
  
  console.log('🎭 Demo mode enabled - using localStorage for authentication');
  
  // Override authentication functions for demo mode
  window.signInWithEmail = async function(email, password) {
    setLoadingState(true);
    
    // Simulate network delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (email === 'demo@messmate.com' && password === 'demo123') {
      const demoUser = {
        id: 'demo-user-123',
        email: email,
        user_metadata: {
          full_name: 'Demo Student',
          first_name: 'Demo',
          last_name: 'Student'
        },
        created_at: new Date().toISOString()
      };
      
      localStorage.setItem('messmate_demo_user', JSON.stringify(demoUser));
      currentUser = demoUser;
      authState.isAuthenticated = true;
      authState.user = demoUser;
      updateAuthUI();
      
      showToast('Demo login successful! Welcome to MessMate.', 'success');
      setLoadingState(false);
      return true;
    } else {
      setLoadingState(false);
      showToast('Demo credentials: demo@messmate.com / demo123', 'error');
      return false;
    }
  };
  
  window.signOut = function() {
    localStorage.removeItem('messmate_demo_user');
    currentUser = null;
    authState.isAuthenticated = false;
    authState.user = null;
    updateAuthUI();
    showToast('Signed out from demo mode', 'info');
  };
}

// Initialize Authentication System
function initializeAuth() {
  console.log('🔐 Initializing MessMate Authentication System...');
  
  // Try to initialize Supabase
  const supabaseInitialized = initializeSupabase();
  
  if (!supabaseInitialized) {
    enableDemoMode();
  }
  
  // Check current auth status
  checkAuthStatus();
  
  // Set up form event listeners
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginForm);
  }
  
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignupForm);
  }
  
  const resetForm = document.getElementById('reset-form');
  if (resetForm) {
    resetForm.addEventListener('submit', handleResetForm);
  }
  
  const googleLoginBtn = document.getElementById('google-login-btn');
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', handleGoogleLogin);
  }
  
  const googleSignupBtn = document.getElementById('google-signup-btn');
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', handleGoogleLogin);
  }
  
  // Password validation for signup page
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      validatePasswordRequirements(e.target.value);
    });
  }
  
  console.log('✅ Authentication system initialized');
}

// Export functions for global use
window.signInWithEmail = signInWithEmail;
window.signUpWithEmail = signUpWithEmail;
window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;
window.resetPassword = resetPassword;
window.showUserMenu = showUserMenu;
window.checkAuthStatus = checkAuthStatus;

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
  initializeAuth();
}
