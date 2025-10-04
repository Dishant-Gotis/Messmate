// Supabase Configuration
// Follow instruction.md to get these values from your Supabase project

const SUPABASE_CONFIG = {
    // Replace with your actual Supabase project URL
    // Find this in: Supabase Dashboard > Settings > API > Project URL
    url: 'https://your-project-ref.supabase.co',
    
    // Replace with your actual Supabase anon/public key  
    // Find this in: Supabase Dashboard > Settings > API > Project API keys > anon public
    anonKey: 'your-anon-key-here',
    
    // Optional: Configure redirect URLs for different environments
    redirectUrls: {
        // Development URL (for local testing)
        development: 'http://localhost:8000',
        // Production URL (replace with your actual domain)
        production: 'https://yourdomain.com'
    }
};

// Environment detection (simple version)
const isProduction = window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1' && 
                    !window.location.hostname.includes('localhost');

// Get the appropriate redirect URL based on environment
const getRedirectUrl = () => {
    return isProduction ? SUPABASE_CONFIG.redirectUrls.production : SUPABASE_CONFIG.redirectUrls.development;
};

// Initialize Supabase client
// Note: This will be used in login-auth.js
let supabase;

// Function to initialize Supabase (called from login-auth.js)
const initializeSupabase = () => {
    // Check if configuration is properly set
    if (SUPABASE_CONFIG.url === 'https://your-project-ref.supabase.co' || 
        SUPABASE_CONFIG.anonKey === 'your-anon-key-here') {
        console.error('⚠️ Supabase configuration not set up properly!');
        console.error('Please update SUPABASE_CONFIG in login-config.js with your actual values.');
        console.error('Follow instruction.md for detailed setup steps.');
        
        // Show user-friendly message
        showMessage('Configuration Error: Please check the console and follow setup instructions.', 'error');
        return null;
    }
    
    try {
        // Create Supabase client using the global supabase object from CDN
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
            auth: {
                // Configure authentication settings
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                // Set redirect URL for OAuth
                redirectTo: getRedirectUrl() + '/dashboard', // Change '/dashboard' to your desired redirect path
            }
        });
        
        console.log('✅ Supabase client initialized successfully');
        return supabase;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
        showMessage('Failed to initialize authentication. Please check your configuration.', 'error');
        return null;
    }
};

// Export configuration for use in other files (if using modules)
// For simple script tags, these will be available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPABASE_CONFIG,
        getRedirectUrl,
        initializeSupabase
    };
}