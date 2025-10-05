# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

MessMate is a professional mess management platform built with pure HTML, CSS, and JavaScript (no frameworks). It's a production-ready web application that connects students with local communal dining services in Pune, Maharashtra.

**Key Architecture:**
- **Frontend**: Vanilla HTML/CSS/JavaScript with modern ES6+ features
- **Authentication**: Supabase integration with demo mode fallback
- **Deployment**: Vercel with static site generation
- **Database**: Supabase (PostgreSQL) with demo in-memory storage

## Common Development Commands

### Local Development
```powershell
# Start local development server
vercel dev

# Open in browser (if vercel dev doesn't auto-open)
# Navigate to http://localhost:3000
```

### Testing & Quality
```powershell
# No build step required (static site)
# Test by opening HTML files directly in browser or using vercel dev

# For testing authentication flows:
# Use demo credentials: demo@messmate.com / demo123

# Verify Supabase connection (check browser console)
# Navigate to login.html and check for "✅ Supabase initialized successfully" message

# Debug authentication issues
# Open test-auth.html in browser to test authentication step-by-step
```

### Deployment
```powershell
# Deploy to preview
vercel

# Deploy to production 
vercel --prod

# Check deployment status
vercel ls
```

## Code Architecture

### Core Application Structure
- **`main.js`**: Primary application logic, mess discovery, filtering, and search
- **`authentication.js`**: Supabase auth integration with demo mode fallback
- **`analytics.js`**: Performance monitoring and user analytics
- **`styles.css`**: Professional design system with CSS custom properties

### Authentication Flow
The app uses an **authentication-first architecture** with a dual-mode authentication system:

**Flow**: `messmate-ten.vercel.app` → Login Required → Home Page

1. **Production Mode**: Full Supabase integration with email/password and Google OAuth
2. **Demo Mode**: Hardcoded credentials when Supabase isn't configured (`demo@messmate.com` / `demo123`)

**Protected Pages**: Both `index.html` (home) and `admin.html` require authentication
**Public Pages**: `login.html`, `signup.html`, `forgot-password.html`

Key authentication functions:
- `initializeSupabase()`: Checks for valid Supabase credentials
- `signInWithEmail()`: Handles email/password authentication with redirect support
- `checkAuthStatus()`: Validates current authentication state
- `isUserAuthenticated()`: Global auth check for protected pages
- `updateAuthUI()`: Dynamically updates navbar based on auth state

### State Management
The application uses a simple global state pattern:
```javascript
const state = {
  messes: [],           // Array of mess data
  userLocation: null,   // User's geolocation for distance sorting
  loading: false,       // Loading state
  user: null,          // Current authenticated user
  isAuthenticated: false
};
```

### Data Layer
- **Sample Data**: `SAMPLE_MESSES` array with 10 realistic mess entries
- **Dynamic Filtering**: Real-time search and filtering by type, price, rating
- **Geolocation**: Automatic distance calculation using Haversine formula
- **Admin Panel**: In-memory CRUD operations for demo purposes

### UI Components
The app uses a modular CSS component system:
- **Cards**: `.card` for mess listings and forms
- **Buttons**: `.btn` with variants (ghost, success, error)
- **Forms**: `.input`, `.select` with consistent styling
- **Grid**: `.grid.mess` for responsive mess card layout
- **Toast Notifications**: Dynamic toast system for user feedback

## Environment Configuration

### Required Environment Variables (Vercel)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://faetszbcjwfosgexemhz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZXRzemJjandmb3NnZXhlbWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODA5NjMsImV4cCI6MjA3NTE1Njk2M30.XPdnaw65T_ZclF9otchyRL-s6jRL_P4oy9wJUsloh6I

# Application Configuration  
VITE_APP_URL=https://messmate-ten.vercel.app
VITE_ENABLE_DEMO_MODE=true
VITE_ENABLE_GOOGLE_AUTH=true

# Analytics (Optional)
VITE_ENABLE_ANALYTICS=true
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### Supabase Setup Status
**Current Status**: The project has Supabase credentials configured: `https://faetszbcjwfosgexemhz.supabase.co`

**Important**: Your app should now use Supabase authentication instead of demo mode.

To verify Supabase integration:
1. Open `login.html` in browser and check console for "✅ Supabase initialized successfully"
2. Try logging in - if Supabase works, you'll see real authentication
3. If you see "⚠️ Supabase credentials not configured", check browser console for errors
4. Configure site URL in Supabase dashboard: `https://messmate-ten.vercel.app`
5. Add redirect URLs for authentication flows
6. Enable email authentication provider in Supabase dashboard

## Key Files and Responsibilities

### Frontend Pages
- **`index.html`**: Main student interface with mess discovery
- **`admin.html`**: Admin dashboard for managing messes and students
- **`login.html`**: Authentication page with email/password and Google OAuth
- **`signup.html`**: User registration page
- **`forgot-password.html`**: Password recovery page

### Configuration Files
- **`vercel.json`**: Vercel deployment configuration with security headers
- **`package.json`**: Project metadata and scripts (minimal dependencies)
- **`.gitignore`**: Standard Node.js gitignore with Vercel additions

### Documentation
- **`instruction.md`**: Detailed Supabase setup guide
- **`DEPLOYMENT.md`**: Production deployment checklist
- **`PRODUCTION-READY.md`**: Feature completion status

## Development Patterns

### CSS Architecture
Uses CSS custom properties for consistent theming:
```css
:root {
  --primary: #2563EB;        /* Professional Blue */
  --success: #059669;        /* Emerald Green */
  --error: #DC2626;          /* Red */
  --veg: #16A34A;            /* Green for Vegetarian */
  --non-veg: #DC2626;        /* Red for Non-Vegetarian */
}
```

### JavaScript Patterns
- **Pure Functions**: Utility functions like `calculateDistance()`, `escapeHtml()`
- **Event-Driven**: DOM event listeners for user interactions
- **Async/Await**: Modern promise handling for Supabase calls
- **Error Handling**: Try/catch blocks with user-friendly error messages

### Security Considerations
- **XSS Prevention**: HTML escaping with `escapeHtml()` function
- **Input Validation**: Client-side validation for all forms
- **CSP Headers**: Content Security Policy configured in `vercel.json`
- **Environment Variables**: Sensitive data stored in environment variables

## Testing Approaches

### Manual Testing
- Open `index.html` in browser to test main functionality
- Use demo credentials for authentication testing
- Test responsive design across different screen sizes
- Verify geolocation features (requires HTTPS/localhost)

### Authentication Testing
```javascript
// Demo credentials for testing
email: "demo@messmate.com"
password: "demo123"
```

## Performance Considerations

### Optimization Features
- **Static Assets**: All resources served from CDN via Vercel
- **Lazy Loading**: Skeleton screens for better perceived performance
- **Caching**: Long-term caching for assets, no-cache for HTML
- **Compression**: Automatic Gzip/Brotli compression via Vercel

### Core Web Vitals
- **LCP**: Optimized with fast loading and skeleton states
- **FID**: Minimal JavaScript for quick interactivity
- **CLS**: Stable layouts with proper image/content sizing

## Deployment Notes

The application is configured for automatic deployment:
- **Push to main branch**: Triggers production deployment
- **Pull requests**: Generate preview deployments
- **Vercel Dashboard**: Monitor performance and errors

### Security Headers
Configured in `vercel.json` with production-grade security:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)  
- X-Frame-Options (Clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)

## Troubleshooting

### Common Issues

#### **Authentication-First Architecture**
**Expected Flow**: 
- Visit `messmate-ten.vercel.app` → Automatically redirects to login if not authenticated
- After successful login → Redirects to home page (`index.html`)
- Navbar shows user name instead of login buttons

#### **Sign In Page Reloading / Not Redirecting**
If the login form submits but stays on the same page:
1. Open browser console (F12) and look for authentication logs
2. Look for "🔐 Attempting sign in" and "✅ User authenticated successfully" messages
3. Use `test-auth.html` to debug the authentication flow step-by-step
4. Check if Supabase initialization is successful
5. Verify your Supabase project is active and email auth is enabled
6. For demo mode: use `demo@messmate.com` / `demo123`

#### **Other Issues**
1. **Authentication not working**: Check if Supabase URL/keys are set in Vercel environment variables
2. **Demo mode active**: Default behavior when Supabase credentials aren't configured
3. **Geolocation not working**: Requires HTTPS or localhost, user must grant permission
4. **Admin panel data not persisting**: Uses in-memory storage for demo purposes

### Development Setup Issues
- Ensure modern browser support (ES6+ features used)
- Check that Vercel CLI is installed for local development
- Verify environment variables are set correctly in Vercel dashboard