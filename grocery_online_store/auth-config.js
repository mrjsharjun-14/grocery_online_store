/**
 * ============================================
 * Google Authentication Configuration
 * ============================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project or select an existing one
 * 3. Enable the Google+ API
 * 4. Go to Credentials and create OAuth 2.0 credentials (Web application)
 * 5. Add authorized JavaScript origins: http://127.0.0.1:5501
 * 6. Add authorized redirect URIs: http://127.0.0.1:5501/index.html
 * 7. Copy your Client ID below
 * 
 * IMPORTANT: Keep your Client ID private in production!
 */

// ============================================
// GOOGLE CLIENT ID - ADD YOUR CLIENT ID HERE!
// ============================================
const GOOGLE_CLIENT_ID = ''; // Example: '123456789-abc123def456.apps.googleusercontent.com'

// ============================================
// Authentication Configuration
// ============================================
const AUTH_CONFIG = {
    googleClientId: GOOGLE_CLIENT_ID,
    storageKeys: {
        user: 'currentUser',
        token: 'googleToken',
        isLoggedIn: 'isLoggedIn',
        loginTime: 'loginTime'
    },
    redirectUrls: {
        afterLogin: 'index.html#home',
        login: 'modern-login.html',
        signup: 'signup.html'
    },
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    publicPages: ['modern-login.html', 'signup.html'], // Pages accessible without login
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AUTH_CONFIG;
}
