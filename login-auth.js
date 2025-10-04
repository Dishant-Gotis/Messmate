// Authentication Logic for MessMate Login System
// Handles email, phone, and Google OAuth authentication with Supabase

// State management
let currentAuthMode = 'signin'; // 'signin' or 'signup'
let currentMethod = 'email'; // 'email' or 'phone'
let phoneVerificationToken = null;

// DOM elements
const elements = {
    // Auth toggle
    loginTab: document.getElementById('login-tab'),
    signupTab: document.getElementById('signup-tab'),
    
    // Method toggle
    emailMethodBtn: document.getElementById('email-method-btn'),
    phoneMethodBtn: document.getElementById('phone-method-btn'),
    
    // Forms
    emailForm: document.getElementById('email-form'),
    phoneForm: document.getElementById('phone-form'),
    authForm: document.getElementById('auth-form'),
    
    // Phone steps
    phoneInputStep: document.getElementById('phone-input-step'),
    phoneVerifyStep: document.getElementById('phone-verify-step'),
    
    // Input fields
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    phone: document.getElementById('phone'),
    verificationCode: document.getElementById('verification-code'),
    
    // Buttons
    emailAuthBtn: document.getElementById('email-auth-btn'),
    emailAuthText: document.getElementById('email-auth-text'),
    emailLoading: document.getElementById('email-loading'),
    
    sendSmsBtn: document.getElementById('send-sms-btn'),
    smsText: document.getElementById('sms-text'),
    smsLoading: document.getElementById('sms-loading'),
    
    verifyCodeBtn: document.getElementById('verify-code-btn'),
    verifyText: document.getElementById('verify-text'),
    verifyLoading: document.getElementById('verify-loading'),
    
    resendCodeBtn: document.getElementById('resend-code-btn'),
    backToPhoneBtn: document.getElementById('back-to-phone-btn'),
    
    googleLoginBtn: document.getElementById('google-login-btn'),
    forgotPasswordBtn: document.getElementById('forgot-password-btn'),
    
    // Messages
    messageContainer: document.getElementById('message-container'),
    message: document.getElementById('message'),
    
    // Loading overlay
    loadingOverlay: document.getElementById('loading-overlay')
};

// Utility Functions
function showMessage(text, type = 'info') {
    elements.message.textContent = text;
    elements.message.className = `message ${type}`;
    elements.messageContainer.style.display = 'block';
    
    // Auto-hide after 5 seconds for success/info messages
    if (type !== 'error') {
        setTimeout(() => {
            elements.messageContainer.style.display = 'none';
        }, 5000);
    }
}

function hideMessage() {
    elements.messageContainer.style.display = 'none';
}

function showLoadingOverlay(show = true) {
    elements.loadingOverlay.style.display = show ? 'flex' : 'none';
}

function setButtonLoading(button, textElement, loadingElement, isLoading) {
    button.disabled = isLoading;
    textElement.style.display = isLoading ? 'none' : 'inline';
    loadingElement.style.display = isLoading ? 'inline-block' : 'none';
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    // Basic phone validation - should start with + and have 10-15 digits
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

// Authentication Mode Toggle
function setAuthMode(mode) {
    currentAuthMode = mode;
    
    // Update tab styles
    elements.loginTab.classList.toggle('active', mode === 'signin');
    elements.signupTab.classList.toggle('active', mode === 'signup');
    
    // Update button text and subtitle
    const isSignup = mode === 'signup';
    elements.emailAuthText.textContent = isSignup ? 'Sign Up' : 'Sign In';
    document.querySelector('.brand-subtitle').textContent = 
        isSignup ? 'Create your account to get started' : 'Welcome back! Sign in to continue';
        
    // Show/hide forgot password link
    document.querySelector('.forgot-password').style.display = isSignup ? 'none' : 'block';
    
    hideMessage();
}

// Authentication Method Toggle
function setAuthMethod(method) {
    currentMethod = method;
    
    // Update method button styles
    elements.emailMethodBtn.classList.toggle('active', method === 'email');
    elements.phoneMethodBtn.classList.toggle('active', method === 'phone');
    
    // Show/hide forms
    elements.emailForm.style.display = method === 'email' ? 'block' : 'none';
    elements.phoneForm.style.display = method === 'phone' ? 'block' : 'none';
    
    // Reset phone form to first step
    if (method === 'phone') {
        resetPhoneForm();
    }
    
    hideMessage();
}

function resetPhoneForm() {
    elements.phoneInputStep.style.display = 'block';
    elements.phoneVerifyStep.style.display = 'none';
    elements.phone.value = '';
    elements.verificationCode.value = '';
    phoneVerificationToken = null;
}

// Email Authentication
async function handleEmailAuth(e) {
    e.preventDefault();
    
    const email = elements.email.value.trim();
    const password = elements.password.value;
    
    // Validation
    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showMessage('Password must be at least 6 characters long.', 'error');
        return;
    }
    
    setButtonLoading(elements.emailAuthBtn, elements.emailAuthText, elements.emailLoading, true);
    hideMessage();
    
    try {
        let result;
        
        if (currentAuthMode === 'signup') {
            // Sign up
            result = await supabase.auth.signUp({
                email: email,
                password: password,
            });
            
            if (result.error) throw result.error;
            
            if (result.data?.user && !result.data.session) {
                showMessage('Please check your email and click the confirmation link to activate your account.', 'success');
            } else if (result.data?.session) {
                showMessage('Account created successfully! Redirecting...', 'success');
                setTimeout(() => redirectAfterAuth(), 1500);
            }
        } else {
            // Sign in
            result = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            
            if (result.error) throw result.error;
            
            showMessage('Sign in successful! Redirecting...', 'success');
            setTimeout(() => redirectAfterAuth(), 1500);
        }
        
    } catch (error) {
        console.error('Email auth error:', error);
        showMessage(getErrorMessage(error), 'error');
    } finally {
        setButtonLoading(elements.emailAuthBtn, elements.emailAuthText, elements.emailLoading, false);
    }
}

// Phone Authentication
async function handlePhoneSendSMS() {
    const phone = elements.phone.value.trim();
    
    if (!validatePhone(phone)) {
        showMessage('Please enter a valid phone number with country code (e.g., +1234567890).', 'error');
        return;
    }
    
    setButtonLoading(elements.sendSmsBtn, elements.smsText, elements.smsLoading, true);
    hideMessage();
    
    try {
        const result = await supabase.auth.signInWithOtp({
            phone: phone,
        });
        
        if (result.error) throw result.error;
        
        // Store phone for verification step
        phoneVerificationToken = phone;
        
        // Switch to verification step
        elements.phoneInputStep.style.display = 'none';
        elements.phoneVerifyStep.style.display = 'block';
        
        showMessage('Verification code sent! Please check your phone.', 'success');
        
    } catch (error) {
        console.error('Phone SMS error:', error);
        showMessage(getErrorMessage(error), 'error');
    } finally {
        setButtonLoading(elements.sendSmsBtn, elements.smsText, elements.smsLoading, false);
    }
}

async function handlePhoneVerifyCode() {
    const code = elements.verificationCode.value.trim();
    
    if (!code || code.length !== 6) {
        showMessage('Please enter a valid 6-digit verification code.', 'error');
        return;
    }
    
    if (!phoneVerificationToken) {
        showMessage('Session expired. Please request a new code.', 'error');
        resetPhoneForm();
        return;
    }
    
    setButtonLoading(elements.verifyCodeBtn, elements.verifyText, elements.verifyLoading, true);
    hideMessage();
    
    try {
        const result = await supabase.auth.verifyOtp({
            phone: phoneVerificationToken,
            token: code,
            type: 'sms'
        });
        
        if (result.error) throw result.error;
        
        showMessage('Phone verification successful! Redirecting...', 'success');
        setTimeout(() => redirectAfterAuth(), 1500);
        
    } catch (error) {
        console.error('Phone verification error:', error);
        showMessage(getErrorMessage(error), 'error');
    } finally {
        setButtonLoading(elements.verifyCodeBtn, elements.verifyText, elements.verifyLoading, false);
    }
}

async function handlePhoneResendCode() {
    if (!phoneVerificationToken) {
        showMessage('Session expired. Please enter your phone number again.', 'error');
        resetPhoneForm();
        return;
    }
    
    elements.resendCodeBtn.disabled = true;
    elements.resendCodeBtn.textContent = 'Sending...';
    
    try {
        const result = await supabase.auth.signInWithOtp({
            phone: phoneVerificationToken,
        });
        
        if (result.error) throw result.error;
        
        showMessage('New verification code sent!', 'success');
        
        // Disable resend button for 60 seconds
        let countdown = 60;
        const interval = setInterval(() => {
            elements.resendCodeBtn.textContent = `Resend Code (${countdown}s)`;
            countdown--;
            
            if (countdown < 0) {
                clearInterval(interval);
                elements.resendCodeBtn.disabled = false;
                elements.resendCodeBtn.textContent = 'Resend Code';
            }
        }, 1000);
        
    } catch (error) {
        console.error('Phone resend error:', error);
        showMessage(getErrorMessage(error), 'error');
        elements.resendCodeBtn.disabled = false;
        elements.resendCodeBtn.textContent = 'Resend Code';
    }
}

// Google OAuth Authentication
async function handleGoogleAuth() {
    showLoadingOverlay(true);
    hideMessage();
    
    try {
        const result = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: getRedirectUrl() + '/dashboard' // This should match your redirect URL configuration
            }
        });
        
        if (result.error) throw result.error;
        
        // OAuth will redirect to Google, so we don't need to handle success here
        // The redirect will happen automatically
        
    } catch (error) {
        console.error('Google OAuth error:', error);
        showMessage(getErrorMessage(error), 'error');
        showLoadingOverlay(false);
    }
}

// Forgot Password
async function handleForgotPassword() {
    const email = elements.email.value.trim();
    
    if (!validateEmail(email)) {
        showMessage('Please enter your email address first.', 'error');
        elements.email.focus();
        return;
    }
    
    elements.forgotPasswordBtn.disabled = true;
    elements.forgotPasswordBtn.textContent = 'Sending...';
    
    try {
        const result = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: getRedirectUrl() + '/reset-password', // You'll need to create this page
        });
        
        if (result.error) throw result.error;
        
        showMessage('Password reset email sent! Please check your inbox.', 'success');
        
    } catch (error) {
        console.error('Forgot password error:', error);
        showMessage(getErrorMessage(error), 'error');
    } finally {
        elements.forgotPasswordBtn.disabled = false;
        elements.forgotPasswordBtn.textContent = 'Forgot your password?';
    }
}

// Error Message Handling
function getErrorMessage(error) {
    const errorMessages = {
        'Invalid login credentials': 'Invalid email or password. Please try again.',
        'Email not confirmed': 'Please check your email and click the confirmation link.',
        'User already registered': 'An account with this email already exists. Please sign in instead.',
        'Phone number not authorized': 'Phone authentication is not enabled for this project.',
        'Invalid phone number': 'Please enter a valid phone number with country code.',
        'Token has expired or is invalid': 'Verification code has expired. Please request a new one.',
        'Too many requests': 'Too many attempts. Please wait a few minutes before trying again.',
    };
    
    return errorMessages[error.message] || error.message || 'An unexpected error occurred. Please try again.';
}

// Redirect After Successful Authentication
function redirectAfterAuth() {
    // Check if there's a redirect URL in the query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect_to');
    
    if (redirectTo) {
        window.location.href = redirectTo;
    } else {
        // Default redirect - change this to your app's main page
        window.location.href = '/dashboard'; // or 'index.html' or wherever you want users to go
    }
}

// Check for existing session on page load
async function checkExistingSession() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            showMessage('You are already signed in. Redirecting...', 'info');
            setTimeout(() => redirectAfterAuth(), 1000);
            return true;
        }
    } catch (error) {
        console.error('Session check error:', error);
    }
    return false;
}

// Handle OAuth redirect
async function handleOAuthRedirect() {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
        console.error('OAuth redirect error:', error);
        showMessage(getErrorMessage(error), 'error');
        return;
    }
    
    if (data.session) {
        showMessage('Authentication successful! Redirecting...', 'success');
        setTimeout(() => redirectAfterAuth(), 1500);
    }
}

// Event Listeners
function setupEventListeners() {
    // Auth mode toggle
    elements.loginTab.addEventListener('click', () => setAuthMode('signin'));
    elements.signupTab.addEventListener('click', () => setAuthMode('signup'));
    
    // Method toggle
    elements.emailMethodBtn.addEventListener('click', () => setAuthMethod('email'));
    elements.phoneMethodBtn.addEventListener('click', () => setAuthMethod('phone'));
    
    // Email form
    elements.authForm.addEventListener('submit', handleEmailAuth);
    
    // Phone form
    elements.sendSmsBtn.addEventListener('click', handlePhoneSendSMS);
    elements.verifyCodeBtn.addEventListener('click', handlePhoneVerifyCode);
    elements.resendCodeBtn.addEventListener('click', handlePhoneResendCode);
    elements.backToPhoneBtn.addEventListener('click', resetPhoneForm);
    
    // Social auth
    elements.googleLoginBtn.addEventListener('click', handleGoogleAuth);
    
    // Forgot password
    elements.forgotPasswordBtn.addEventListener('click', handleForgotPassword);
    
    // Enter key handling for phone verification
    elements.verificationCode.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handlePhoneVerifyCode();
        }
    });
    
    // Phone number formatting (optional - adds country code if missing)
    elements.phone.addEventListener('blur', (e) => {
        let phone = e.target.value.trim();
        if (phone && !phone.startsWith('+')) {
            // Assume US number if no country code provided
            phone = '+1' + phone;
            e.target.value = phone;
        }
    });
}

// Initialize the application
async function initializeApp() {
    console.log('🚀 Initializing MessMate Auth...');
    
    // Initialize Supabase
    const client = initializeSupabase();
    if (!client) {
        console.error('Failed to initialize Supabase client');
        return;
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Check for existing session
    const hasSession = await checkExistingSession();
    if (hasSession) {
        return; // User is already authenticated
    }
    
    // Handle OAuth redirect if present
    if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
        await handleOAuthRedirect();
    }
    
    console.log('✅ MessMate Auth initialized successfully');
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}