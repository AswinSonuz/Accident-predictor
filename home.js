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
    initializeMap();
    loadStatistics();
});

// Google Map Instance
let map;
let userMarker;

function initializeMap() {
    try {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        // Default location (can be changed to user's actual location)
        const defaultLocation = { lat: 40.7128, lng: -74.0060 };

        map = new google.maps.Map(mapElement, {
            zoom: 12,
            center: defaultLocation,
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true,
            streetViewControl: true
        });

        // Add initial marker
        userMarker = new google.maps.Marker({
            position: defaultLocation,
            map: map,
            title: 'Your Location',
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });

        // Update coordinates display
        updateCoordinates(defaultLocation.lat, defaultLocation.lng);

    } catch (error) {
        console.log('Google Maps not loaded. Using fallback.');
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        notify.show('📍 Getting your location...', 'info', 3000);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                updateMapLocation(lat, lng);
                updateCoordinates(lat, lng);
                notify.success('✓ Location updated!', 3000);
            },
            (error) => {
                notify.error('✕ Could not get location: ' + error.message);
            }
        );
    } else {
        notify.error('✕ Geolocation not supported by your browser');
    }
}

function updateMapLocation(lat, lng) {
    if (!map) return;

    const location = { lat: lat, lng: lng };
    map.setCenter(location);
    
    if (userMarker) {
        userMarker.setPosition(location);
    }
}

function updateCoordinates(lat, lng) {
    document.getElementById('latitude').textContent = lat.toFixed(6);
    document.getElementById('longitude').textContent = lng.toFixed(6);
}

// Accident Risk Prediction
async function predictAccidentRisk() {
    const weather = document.getElementById('weather').value;
    const time = document.getElementById('time').value;
    const roadType = document.getElementById('roadType').value;
    const trafficDensity = document.getElementById('trafficDensity').value;
    const speed = parseFloat(document.getElementById('speed').value) || 0;
    const visibility = parseFloat(document.getElementById('visibility').value) || 1000;

    // Validation
    if (!weather || !time || !roadType || !trafficDensity) {
        notify.error('✕ Please fill all required fields');
        return;
    }

    if (speed > 200 || speed < 0) {
        notify.error('✕ Invalid speed value');
        return;
    }

    try {
        // Calculate risk using API
        const riskData = await calculateRiskPrediction(weather, time, roadType, trafficDensity, speed, visibility);

        // Display results
        displayPredictionResult(riskData);

        // Update statistics
        await updateStatistics(riskData.riskLevel);

        // Show appropriate notification based on risk level
        if (riskData.riskLevel === 'High') {
            const lat = document.getElementById('latitude').textContent;
            const lng = document.getElementById('longitude').textContent;
            notify.highRisk(`Risk Probability: ${riskData.probability.toFixed(1)}%`, `${lat}, ${lng}`);
        } else if (riskData.riskLevel === 'Medium') {
            notify.mediumRisk(`⚠ Medium risk detected: ${riskData.probability.toFixed(1)}% probability`);
        } else {
            notify.lowRisk(`✓ Low risk area: ${riskData.probability.toFixed(1)}% probability`);
        }
    } catch (error) {
        notify.error('✕ Failed to get prediction: ' + error.message);
    }
}

// API call to backend for risk prediction
async function calculateRiskPrediction(weather, time, roadType, trafficDensity, speed, visibility) {
    const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            weather, time, roadType, trafficDensity, speed, visibility
        })
    });
    if (!response.ok) {
        throw new Error('Prediction failed');
    }
    return await response.json();
}

function displayPredictionResult(riskData) {
    const resultContainer = document.getElementById('predictionResult');
    const riskGauge = document.getElementById('riskGauge');
    const riskLevel = document.getElementById('riskLevel');
    const riskProbability = document.getElementById('riskProbability');
    const riskMessage = document.getElementById('riskMessage');

    // Update gauge
    riskGauge.textContent = riskData.probability.toFixed(0) + '%';
    riskGauge.className = `risk-gauge ${riskData.riskLevel.toLowerCase()}`;

    // Update risk level
    riskLevel.textContent = riskData.riskLevel;
    riskLevel.className = `risk-level-text ${riskData.riskLevel.toLowerCase()}`;

    // Update probability
    riskProbability.textContent = riskData.probability.toFixed(1) + '%';

    // Update message
    riskMessage.innerHTML = `<strong>Assessment:</strong> ${riskData.message}`;

    // Show result container
    resultContainer.classList.remove('hidden');

    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Statistics Management
async function updateStatistics(riskLevel) {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    const predictionData = {
        riskLevel,
        timestamp: new Date().toISOString(),
        probability: 0 // Will be set by API, but for now
    };

    try {
        await fetch('/api/save-prediction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userEmail,
                data: predictionData
            })
        });
        await loadStatistics();
    } catch (error) {
        console.error('Failed to save prediction:', error);
    }
}

async function loadStatistics() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    try {
        const response = await fetch(`/api/load-predictions?email=${encodeURIComponent(userEmail)}`);
        const predictions = await response.json();

        const totalPredictions = predictions.length;
        const highRiskCount = predictions.filter(p => p.riskLevel === 'High').length;

        document.getElementById('totalPredictions').textContent = totalPredictions;
        document.getElementById('highRiskCount').textContent = highRiskCount;

        const averageRisk = totalPredictions > 0 
            ? ((highRiskCount / totalPredictions) * 100).toFixed(1)
            : 0;
        
        document.getElementById('averageRisk').textContent = averageRisk + '%';
    } catch (error) {
        console.error('Failed to load statistics:', error);
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        window.location.href = 'login.html';
    }
}

// NOTE: To integrate with actual ML model:
// 1. Upload the accident_risk_model.joblib file
// 2. Create a Python backend (Flask/Django) to serve predictions
// 3. Replace calculateRiskPrediction() with an API call to the backend
// Example:
/*
async function calculateRiskPrediction(weather, time, roadType, trafficDensity, speed, visibility) {
    const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            weather, time, roadType, trafficDensity, speed, visibility
        })
    });
    return await response.json();
}
*/
