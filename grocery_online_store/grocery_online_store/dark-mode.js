/**
 * Modern Dark Mode Toggle System
 * Features:
 * - System theme detection
 * - localStorage persistence
 * - Smooth transitions
 * - No flash on page load
 */

class DarkModeToggle {
    constructor() {
        this.HTML = document.documentElement;
        this.toggleBtn = document.getElementById('themeToggle');
        this.theme = this.getTheme();
        
        this.init();
    }

    /**
     * Get current theme from localStorage or system preference
     */
    getTheme() {
        const stored = localStorage.getItem('theme');
        
        if (stored) {
            return stored;
        }

        // Detect system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches 
            ? 'dark' 
            : 'light';
    }

    /**
     * Apply theme to document
     */
    setTheme(theme) {
        this.theme = theme;
        
        // Update DOM
        this.HTML.setAttribute('data-theme', theme);
        document.body.classList.toggle('dark', theme === 'dark');
        
        // Save preference
        localStorage.setItem('theme', theme);
        
        // Update button icon
        this.updateIcon();
        
        // Fire custom event
        window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme } }));
    }

    /**
     * Update toggle button icon
     */
    updateIcon() {
        if (!this.toggleBtn) return;
        
        const icon = this.toggleBtn.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = this.theme === 'dark' ? '☀️' : '🌙';
        }
    }

    /**
     * Toggle between light and dark
     */
    toggle() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    /**
     * Initialize dark mode
     */
    init() {
        // Apply initial theme
        this.setTheme(this.theme);

        // Bind toggle button
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
            
            // Add keyboard support
            this.toggleBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggle();
                }
            });
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Only apply if user hasn't set a preference
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DarkModeToggle();
    });
} else {
    new DarkModeToggle();
}
