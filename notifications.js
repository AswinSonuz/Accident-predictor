// Notification System
class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notificationContainer');
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Add icon based on type
        let icon = '';
        switch(type) {
            case 'success':
                icon = '✓';
                break;
            case 'error':
                icon = '✕';
                break;
            case 'warning':
                icon = '⚠';
                break;
            case 'high-risk':
                icon = '🚨';
                break;
            case 'medium-risk':
                icon = '⚠';
                break;
            case 'low-risk':
                icon = '✓';
                break;
            default:
                icon = 'ℹ';
        }

        notification.innerHTML = `
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.container.appendChild(notification);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }

        return notification;
    }

    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    // High risk notification - longer duration
    highRisk(message, location = '') {
        const fullMessage = location 
            ? `🚗 HIGH ACCIDENT RISK DETECTED at ${location}! ${message}`
            : `🚗 HIGH ACCIDENT RISK DETECTED! ${message}`;
        
        const notif = this.show(fullMessage, 'high-risk', 0); // Don't auto-close
        notif.style.animation = 'pulse 1s infinite';
        
        // Play sound alert
        this.playAlert('high');
        
        // Also play browser notification if permitted
        this.showBrowserNotification('HIGH ACCIDENT RISK ALERT', fullMessage);
        
        return notif;
    }

    mediumRisk(message) {
        const notif = this.show(message, 'medium-risk', 6000);
        this.playAlert('medium');
        return notif;
    }

    lowRisk(message) {
        return this.show(message, 'low-risk', 4000);
    }

    playAlert(level = 'medium') {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (level === 'high') {
            oscillator.frequency.value = 1000; // Higher pitch for high risk
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } else {
            oscillator.frequency.value = 600;
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        }
    }

    showBrowserNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23e74c3c"/><text x="50" y="60" font-size="50" text-anchor="middle" fill="white">!</text></svg>'
            });
        }
    }

    requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Create global notification instance
const notify = new NotificationSystem();

// Request notification permission on page load
document.addEventListener('DOMContentLoaded', () => {
    notify.requestPermission();
});

// Add CSS for notifications
const notificationStyles = `
.notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 400px;
}

.notification {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 16px 20px;
    margin-bottom: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideInRight 0.3s ease-out;
    background: white;
    border-left: 5px solid #667eea;
}

.notification-info {
    border-left-color: #3498db;
}

.notification-success {
    border-left-color: #27ae60;
    background: #d5f4e6;
}

.notification-error {
    border-left-color: #e74c3c;
    background: #fadbd8;
}

.notification-warning {
    border-left-color: #f39c12;
    background: #fef5e7;
}

.notification-high-risk {
    border-left-color: #c0392b;
    background: #fadbd8;
    border: 2px solid #c0392b;
    padding: 15px 19px;
}

.notification-medium-risk {
    border-left-color: #e67e22;
    background: #fdebd0;
}

.notification-low-risk {
    border-left-color: #27ae60;
    background: #d5f4e6;
}

.notification-icon {
    font-size: 20px;
    font-weight: bold;
    min-width: 24px;
}

.notification-message {
    flex: 1;
    color: #333;
    font-size: 14px;
    line-height: 1.4;
}

.notification-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    padding: 0;
    margin-left: 10px;
}

.notification-close:hover {
    color: #333;
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(400px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes pulse {
    0%, 100% {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    50% {
        box-shadow: 0 4px 20px rgba(192, 57, 43, 0.3);
    }
}

@media (max-width: 768px) {
    .notification-container {
        left: 10px;
        right: 10px;
        max-width: none;
    }

    .notification {
        padding: 12px 16px;
    }

    .notification-message {
        font-size: 13px;
    }
}
`;

// Inject notification styles
const styleElement = document.createElement('style');
styleElement.textContent = notificationStyles;
document.head.appendChild(styleElement);
