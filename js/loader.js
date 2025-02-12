/*
 * Copyright 2025 Alvin Rahul Chauhan. All rights reserved.
 */

// Handle page loading state
document.addEventListener('DOMContentLoaded', function() {
    // Show content once everything is loaded
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

    // Fallback in case load event doesn't fire
    setTimeout(function() {
        if (!document.body.classList.contains('loaded')) {
            document.body.classList.add('loaded');
        }
    }, 2000);
});
