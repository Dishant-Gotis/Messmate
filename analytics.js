// MessMate Analytics and Performance Monitoring
// Production-ready analytics with privacy-first approach

// Analytics Configuration
const ANALYTICS_CONFIG = {
  enabled: import.meta.env?.VITE_ENABLE_ANALYTICS === 'true',
  googleAnalyticsId: import.meta.env?.VITE_GOOGLE_ANALYTICS_ID,
  vercelAnalyticsId: import.meta.env?.VITE_VERCEL_ANALYTICS_ID,
  appUrl: import.meta.env?.VITE_APP_URL || 'https://messmate-ten.vercel.app'
};

// Performance Metrics
const performanceMetrics = {
  pageLoadTime: 0,
  authTime: 0,
  apiResponseTime: 0
};

// Initialize Analytics
function initializeAnalytics() {
  if (!ANALYTICS_CONFIG.enabled) {
    console.log('📊 Analytics disabled');
    return;
  }

  console.log('📊 Initializing analytics...');

  // Initialize Google Analytics if configured
  if (ANALYTICS_CONFIG.googleAnalyticsId) {
    initializeGoogleAnalytics();
  }

  // Initialize Vercel Analytics if configured
  if (ANALYTICS_CONFIG.vercelAnalyticsId) {
    initializeVercelAnalytics();
  }

  // Track page performance
  trackPagePerformance();

  // Track user interactions
  trackUserInteractions();
}

// Google Analytics Integration
function initializeGoogleAnalytics() {
  if (typeof gtag === 'undefined') {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.googleAnalyticsId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', ANALYTICS_CONFIG.googleAnalyticsId, {
      page_title: document.title,
      page_location: window.location.href
    });
  }

  console.log('📊 Google Analytics initialized');
}

// Vercel Analytics Integration
function initializeVercelAnalytics() {
  // Vercel Analytics is automatically injected by Vercel
  console.log('📊 Vercel Analytics initialized');
}

// Track Page Performance
function trackPagePerformance() {
  if (!ANALYTICS_CONFIG.enabled) return;

  // Track page load time
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    performanceMetrics.pageLoadTime = loadTime;

    if (window.gtag) {
      gtag('event', 'page_load_time', {
        value: Math.round(loadTime),
        event_category: 'Performance',
        event_label: 'Page Load'
      });
    }

    console.log(`📊 Page load time: ${Math.round(loadTime)}ms`);
  });

  // Track Core Web Vitals
  if ('web-vital' in window) {
    // This would require importing web-vitals library
    // getCLS(console.log);
    // getFID(console.log);
    // getFCP(console.log);
    // getLCP(console.log);
    // getTTFB(console.log);
  }
}

// Track User Interactions
function trackUserInteractions() {
  if (!ANALYTICS_CONFIG.enabled) return;

  // Track authentication events
  const originalUpdateAuthUI = window.updateAuthUI;
  window.updateAuthUI = function() {
    if (originalUpdateAuthUI) {
      originalUpdateAuthUI();
    }
    
    // Track auth state changes
    const isAuthenticated = window.currentUser !== null;
    trackEvent('auth_state_change', {
      authenticated: isAuthenticated,
      user_id: window.currentUser?.id || 'anonymous'
    });
  };

  // Track form submissions
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form.id) {
      trackEvent('form_submit', {
        form_id: form.id,
        form_action: form.action || 'unknown'
      });
    }
  });

  // Track button clicks
  document.addEventListener('click', (e) => {
    const button = e.target.closest('button, .btn');
    if (button) {
      const buttonText = button.textContent?.trim() || button.className;
      trackEvent('button_click', {
        button_text: buttonText,
        button_class: button.className
      });
    }
  });

  // Track navigation
  let currentPath = window.location.pathname;
  setInterval(() => {
    if (window.location.pathname !== currentPath) {
      trackEvent('page_navigation', {
        from: currentPath,
        to: window.location.pathname
      });
      currentPath = window.location.pathname;
    }
  }, 1000);
}

// Track Custom Events
function trackEvent(eventName, parameters = {}) {
  if (!ANALYTICS_CONFIG.enabled) return;

  // Google Analytics
  if (window.gtag) {
    gtag('event', eventName, {
      event_category: 'User Interaction',
      ...parameters
    });
  }

  // Vercel Analytics
  if (window.va && window.va.track) {
    window.va.track(eventName, parameters);
  }

  console.log(`📊 Event tracked: ${eventName}`, parameters);
}

// Track Authentication Performance
function trackAuthPerformance(action, startTime) {
  if (!ANALYTICS_CONFIG.enabled) return;

  const endTime = performance.now();
  const duration = endTime - startTime;
  performanceMetrics.authTime = duration;

  trackEvent('auth_performance', {
    action: action,
    duration: Math.round(duration),
    event_category: 'Authentication'
  });

  console.log(`📊 Auth ${action} took ${Math.round(duration)}ms`);
}

// Track API Performance
function trackApiPerformance(endpoint, startTime) {
  if (!ANALYTICS_CONFIG.enabled) return;

  const endTime = performance.now();
  const duration = endTime - startTime;
  performanceMetrics.apiResponseTime = duration;

  trackEvent('api_performance', {
    endpoint: endpoint,
    duration: Math.round(duration),
    event_category: 'API'
  });

  console.log(`📊 API ${endpoint} took ${Math.round(duration)}ms`);
}

// Error Tracking
function trackError(error, context = {}) {
  if (!ANALYTICS_CONFIG.enabled) return;

  const errorInfo = {
    message: error.message || 'Unknown error',
    stack: error.stack || '',
    url: window.location.href,
    user_agent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    ...context
  };

  trackEvent('error', {
    error_message: errorInfo.message,
    error_type: error.name || 'Error',
    error_context: JSON.stringify(errorInfo),
    event_category: 'Error'
  });

  console.error('📊 Error tracked:', errorInfo);
}

// Track Feature Usage
function trackFeatureUsage(feature, action, metadata = {}) {
  trackEvent('feature_usage', {
    feature: feature,
    action: action,
    ...metadata,
    event_category: 'Feature Usage'
  });
}

// Export functions for global use
window.trackEvent = trackEvent;
window.trackError = trackError;
window.trackFeatureUsage = trackFeatureUsage;
window.trackAuthPerformance = trackAuthPerformance;
window.trackApiPerformance = trackApiPerformance;

// Initialize analytics when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAnalytics);
} else {
  initializeAnalytics();
}

// Global error handler
window.addEventListener('error', (event) => {
  trackError(event.error, {
    type: 'javascript_error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  trackError(event.reason, {
    type: 'unhandled_promise_rejection'
  });
});

