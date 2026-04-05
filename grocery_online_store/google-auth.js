/**
 * ============================================
 * Google Authentication Module
 * ============================================
 * 
 * Complete authentication system with:
 * - Google Sign-In integration
 * - Session management
 * - Auto-login detection
 * - Access control
 * - User profile management
 */

// ============================================
// 1. INITIALIZE GOOGLE SIGN-IN
// ============================================

/**
 * Initialize Google Sign-In on page load
 */
function initializeGoogleSignIn() {
    if (!AUTH_CONFIG.googleClientId) {
        console.warn('Google Client ID not configured. Sign-In disabled.');
        return false;
    }

    try {
        google.accounts.id.initialize({
            client_id: AUTH_CONFIG.googleClientId,
            callback: handleGoogleSignInResponse,
            auto_select: false,
            ux_mode: 'popup'
        });
        console.log('✓ Google Sign-In initialized');
        return true;
    } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        return false;
    }
}

/**
 * Render Google Sign-In button
 */
function renderGoogleSignInButton(containerId) {
    if (!AUTH_CONFIG.googleClientId) {
        console.warn('Cannot render button - Client ID not configured');
        return false;
    }

    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID "${containerId}" not found`);
            return false;
        }

        google.accounts.id.renderButton(container, {
            type: 'standard',
            theme: 'dark',
            size: 'large',
            text: 'continue_with'
        });
        console.log('✓ Google Sign-In button rendered');
        return true;
    } catch (error) {
        console.error('Error rendering Google button:', error);
        return false;
    }
}

// ============================================
// 2. HANDLE GOOGLE SIGN-IN RESPONSE
// ============================================

/**
 * Callback for Google Sign-In
 * Decodes JWT token and extracts user information
 */
function handleGoogleSignInResponse(response) {
    if (!response.credential) {
        console.error('No credential received from Google');
        showError('Sign-In failed. Please try again.');
        return;
    }

    try {
        // Show loading indicator
        showLoadingIndicator(true);

        // Decode JWT token
        const token = response.credential;
        const userInfo = decodeJWT(token);

        if (!userInfo) {
            throw new Error('Failed to decode JWT token');
        }

        // Create user object
        const userData = {
            id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            provider: 'google',
            token: token,
            loginTime: new Date().getTime()
        };

        // Store user and login
        storeUserData(userData);
        notifyLoginSuccess(userData);

        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html#home';
        }, 1500);

    } catch (error) {
        console.error('Error processing Google Sign-In:', error);
        showError('Failed to process sign-in. Error: ' + error.message);
        showLoadingIndicator(false);
    }
}

/**
 * Manually trigger Google Sign-In
 */
function handleGoogleLogin() {
    if (!AUTH_CONFIG.googleClientId) {
        showError('Google Sign-In not configured. Please check auth-config.js');
        return;
    }

    try {
        // Prompt the user to select an account
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
                console.log('Sign-In prompt not displayed');
            } else if (notification.isSkippedMoment()) {
                console.log('Sign-In prompt was skipped');
            }
        });
    } catch (error) {
        console.error('Error triggering Google Sign-In:', error);
        showError('Could not trigger sign-in');
    }
}

// ============================================
// 3. JWT DECODING
// ============================================

/**
 * Decode JWT token (client-side)
 * NOTE: Only decode, never verify on client. Verification should happen on backend.
 */
function decodeJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }

        // Decode payload
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

// ============================================
// 4. USER DATA MANAGEMENT
// ============================================

/**
 * Store user data in localStorage
 */
function storeUserData(userData) {
    try {
        localStorage.setItem(AUTH_CONFIG.storageKeys.user, JSON.stringify(userData));
        localStorage.setItem(AUTH_CONFIG.storageKeys.isLoggedIn, 'true');
        localStorage.setItem(AUTH_CONFIG.storageKeys.loginTime, userData.loginTime.toString());
        console.log('✓ User data stored');
    } catch (error) {
        console.error('Error storing user data:', error);
    }
}

/**
 * Get current logged-in user
 */
function getCurrentUser() {
    try {
        const userJson = localStorage.getItem(AUTH_CONFIG.storageKeys.user);
        return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
        console.error('Error retrieving user data:', error);
        return null;
    }
}

/**
 * Check if user is logged in
 */
function isUserLoggedIn() {
    const isLoggedIn = localStorage.getItem(AUTH_CONFIG.storageKeys.isLoggedIn);
    if (isLoggedIn !== 'true') {
        return false;
    }

    // Check session timeout
    const loginTime = localStorage.getItem(AUTH_CONFIG.storageKeys.loginTime);
    if (loginTime) {
        const elapsed = new Date().getTime() - parseInt(loginTime);
        if (elapsed > AUTH_CONFIG.sessionTimeout) {
            console.log('Session expired');
            clearUserData();
            return false;
        }
    }

    return true;
}

/**
 * Clear user data (logout)
 */
function clearUserData() {
    try {
        localStorage.removeItem(AUTH_CONFIG.storageKeys.user);
        localStorage.removeItem(AUTH_CONFIG.storageKeys.token);
        localStorage.removeItem(AUTH_CONFIG.storageKeys.isLoggedIn);
        localStorage.removeItem(AUTH_CONFIG.storageKeys.loginTime);
        console.log('✓ User data cleared');
    } catch (error) {
        console.error('Error clearing user data:', error);
    }
}

// ============================================
// 5. LOGOUT FUNCTIONALITY
// ============================================

/**
 * Handle user logout
 */
function handleLogout() {
    try {
        // Sign out from Google
        if (typeof google !== 'undefined' && google.accounts) {
            try {
                google.accounts.id.disableAutoSelect();
            } catch (e) {
                console.log('Could not disable auto-select:', e);
            }
        }

        // Clear user data
        clearUserData();

        // Show logout message
        showSuccess('✓ You have been logged out');

        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'modern-login.html';
        }, 1500);

    } catch (error) {
        console.error('Error during logout:', error);
        showError('Logout error: ' + error.message);
    }
}

// ============================================
// 6. ACCESS CONTROL
// ============================================

/**
 * Check login status and redirect if necessary
 */
function checkLoginStatus() {
    if (!isUserLoggedIn()) {
        // User not logged in - check if current page is public
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isPublicPage = AUTH_CONFIG.publicPages.some(page =>
            currentPage.includes(page)
        );

        if (!isPublicPage) {
            // Redirect to login page
            console.log('Access denied - redirecting to login');
            window.location.href = 'modern-login.html?redirect=' + encodeURIComponent(window.location.href);
        }
        return false;
    }
    return true;
}

/**
 * Require login - call this on pages that need authentication
 */
function requireLogin() {
    if (!checkLoginStatus()) {
        throw new Error('Authentication required');
    }
}

/**
 * Auto-login if session exists
 */
function checkAutoLogin() {
    if (isUserLoggedIn()) {
        const user = getCurrentUser();
        if (user) {
            console.log('✓ Auto-login detected for:', user.email);
            displayUserProfile(user);
            return true;
        }
    }
    return false;
}

// ============================================
// 7. USER PROFILE DISPLAY
// ============================================

/**
 * Display user profile in header/navbar
 */
function displayUserProfile(user) {
    if (!user) {
        user = getCurrentUser();
    }

    if (!user) {
        console.warn('No user data to display');
        return;
    }

    try {
        const userProfileElement = document.getElementById('userProfile');
        if (!userProfileElement) {
            console.warn('User profile element not found in DOM');
            return;
        }

        userProfileElement.innerHTML = `
            <div class="user-profile-wrapper">
                <img src="${user.picture}" alt="${user.name}" class="user-avatar" title="${user.email}">
                <span class="user-name">${user.name}</span>
                <button class="logout-btn" onclick="handleLogout()" title="Logout">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"></path>
                        <polyline points="17 16 21 12 17 8"></polyline>
                        <line x1="7" y1="12" x2="21" y2="12"></line>
                    </svg>
                </button>
            </div>
        `;
        console.log('✓ User profile displayed');
    } catch (error) {
        console.error('Error displaying user profile:', error);
    }
}

// ============================================
// 8. UI HELPER FUNCTIONS
// ============================================

/**
 * Show error message
 */
function showError(message) {
    console.error('Error:', message);
    const alertDiv = document.getElementById('alert');
    if (alertDiv) {
        alertDiv.innerHTML = `
            <div class="alert alert-error">
                <span>❌ ${message}</span>
                <button onclick="this.parentElement.style.display='none';">×</button>
            </div>
        `;
        alertDiv.style.display = 'block';
    } else {
        alert('Error: ' + message);
    }
}

/**
 * Show success message
 */
function showSuccess(message) {
    console.log('Success:', message);
    const alertDiv = document.getElementById('alert');
    if (alertDiv) {
        alertDiv.innerHTML = `
            <div class="alert alert-success">
                <span>${message}</span>
                <button onclick="this.parentElement.style.display='none';">×</button>
            </div>
        `;
        alertDiv.style.display = 'block';
    }
}

/**
 * Show loading indicator
 */
function showLoadingIndicator(show) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

// ============================================
// 9. INITIALIZE ON PAGE LOAD
// ============================================

/**
 * Auto-initialize on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing authentication...');

    // Initialize Google Sign-In
    if (typeof google !== 'undefined') {
        initializeGoogleSignIn();
    }

    // Check for auto-login
    checkAutoLogin();

    // Check access control
    checkLoginStatus();
});

// ============================================
// 10. HELPER UTILITIES
// ============================================

/**
 * Notify login success
 */
function notifyLoginSuccess(userData) {
    showSuccess(`✓ Welcome, ${userData.name}!`);
}

/**
 * Get redirect URL from query parameter
 */
function getRedirectUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || AUTH_CONFIG.redirectUrls.afterLogin;
}

/**
 * Format date
 */
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
}

/**
 * Debug mode - log all auth info
 */
function debugAuthInfo() {
    console.group('Authentication Debug Info');
    console.log('Logged in:', isUserLoggedIn());
    console.log('Current user:', getCurrentUser());
    console.log('Client ID configured:', !!AUTH_CONFIG.googleClientId);
    console.log('Public pages:', AUTH_CONFIG.publicPages);
    console.log('Storage keys:', AUTH_CONFIG.storageKeys);
    console.groupEnd();
}

// Expose debug function globally
window.debugAuthInfo = debugAuthInfo;
window.getCurrentUser = getCurrentUser;
window.isUserLoggedIn = isUserLoggedIn;
window.handleLogout = handleLogout;
window.showError = showError;
window.showSuccess = showSuccess;
