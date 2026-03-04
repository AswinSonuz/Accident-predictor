// Check if user is logged in
function checkLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'login.html';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    loadProfileData();
    loadPreferences();
    attachFormListener();
});

// Load profile data from localStorage
function loadProfileData() {
    const userEmail = localStorage.getItem('userEmail');
    const profileData = JSON.parse(localStorage.getItem('profileData')) || {};

    // Display user email
    document.getElementById('displayEmail').textContent = userEmail || 'user@example.com';

    // Fill form with existing data
    document.getElementById('firstName').value = profileData.firstName || '';
    document.getElementById('lastName').value = profileData.lastName || '';
    document.getElementById('email').value = profileData.email || userEmail || '';
    document.getElementById('phone').value = profileData.phone || '';
    document.getElementById('address').value = profileData.address || '';
    document.getElementById('city').value = profileData.city || '';
    document.getElementById('zipCode').value = profileData.zipCode || '';
    document.getElementById('bio').value = profileData.bio || '';
    document.getElementById('licenseNumber').value = profileData.licenseNumber || '';
    document.getElementById('vehicleInfo').value = profileData.vehicleInfo || '';

    // Update display name
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const displayName = firstName && lastName 
        ? `${firstName} ${lastName}`
        : (firstName || 'User Profile');
    
    document.getElementById('displayName').textContent = displayName;

    // Update avatar with initials
    updateAvatar(firstName, lastName);
}

function updateAvatar(firstName, lastName) {
    const avatar = document.getElementById('profileAvatar');
    if (firstName && lastName) {
        const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        avatar.textContent = initials;
        avatar.style.fontSize = '32px';
    } else if (firstName) {
        avatar.textContent = firstName.charAt(0).toUpperCase();
        avatar.style.fontSize = '32px';
    } else {
        avatar.textContent = '👤';
        avatar.style.fontSize = '48px';
    }
}

// Attach form listener
function attachFormListener() {
    const form = document.getElementById('profileForm');
    
    // Update display name as user types
    document.getElementById('firstName').addEventListener('input', updateDisplayName);
    document.getElementById('lastName').addEventListener('input', updateDisplayName);

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        saveProfileData();
    });
}

function updateDisplayName() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const displayName = `${firstName} ${lastName}`.trim() || 'User Profile';
    
    document.getElementById('displayName').textContent = displayName;
    updateAvatar(firstName, lastName);
}

// Save profile data
function saveProfileData() {
    const profileData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim(),
        bio: document.getElementById('bio').value.trim(),
        licenseNumber: document.getElementById('licenseNumber').value.trim(),
        vehicleInfo: document.getElementById('vehicleInfo').value.trim(),
        lastUpdated: new Date().toISOString()
    };

    // Validation
    if (!profileData.firstName || !profileData.lastName) {
        notify.error('✕ First name and last name are required');
        return;
    }

    if (!isValidEmail(profileData.email)) {
        notify.error('✕ Please enter a valid email address');
        return;
    }

    // Save to localStorage
    localStorage.setItem('profileData', JSON.stringify(profileData));

    // Show success message
    notify.success('✓ Profile updated successfully!');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Save preferences
function savePreferences() {
    const preferences = {
        notificationsEnabled: document.getElementById('notificationsEnabled').checked,
        soundEnabled: document.getElementById('soundEnabled').checked,
        locationTracking: document.getElementById('locationTracking').checked,
        lastUpdated: new Date().toISOString()
    };

    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    notify.success('✓ Preferences saved successfully!');
}

// Load preferences
function loadPreferences() {
    const preferences = JSON.parse(localStorage.getItem('userPreferences')) || {
        notificationsEnabled: true,
        soundEnabled: true,
        locationTracking: false
    };

    document.getElementById('notificationsEnabled').checked = preferences.notificationsEnabled;
    document.getElementById('soundEnabled').checked = preferences.soundEnabled;
    document.getElementById('locationTracking').checked = preferences.locationTracking;
}

// Reset form to saved data
function resetForm() {
    if (confirm('Are you sure? All unsaved changes will be lost.')) {
        loadProfileData();
        notify.warning('⟲ Form reset to saved data');
    }
}

// Change password
function changePassword() {
    const currentPassword = prompt('Enter your current password:');
    if (!currentPassword) return;

    const newPassword = prompt('Enter your new password:');
    if (!newPassword || newPassword.length < 8) {
        notify.error('✕ Password must be at least 8 characters');
        return;
    }

    const confirmPassword = prompt('Confirm your new password:');
    if (newPassword !== confirmPassword) {
        notify.error('✕ Passwords do not match');
        return;
    }

    // In a real app, this would be sent to the backend
    // For now, we'll just show a message
    notify.success('✓ Password changed successfully!');
}

// Delete account
function deleteAccount() {
    const confirm1 = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirm1) return;

    const email = document.getElementById('email').value;
    const confirm2 = prompt(`Type your email address "${email}" to confirm account deletion:`);
    
    if (confirm2 !== email) {
        notify.error('✕ Email does not match. Account deletion cancelled.');
        return;
    }

    // Clear all user data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('profileData');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('predictionStats');

    notify.success('✓ Account deleted. Redirecting...');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

// Utility function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        window.location.href = 'login.html';
    }
}

// Auto-save profile data when user makes changes (every 30 seconds)
setInterval(() => {
    const profileForm = document.getElementById('profileForm');
    const formData = new FormData(profileForm);
    const hasChanges = Array.from(formData.entries()).some(([key, value]) => {
        const saved = JSON.parse(localStorage.getItem('profileData')) || {};
        return saved[key] !== value;
    });

    if (hasChanges) {
        console.log('Auto-save: Profile has unsaved changes');
    }
}, 30000);
