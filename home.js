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
function predictAccidentRisk() {
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

    // Calculate risk using ML Model Simulation
    const riskData = calculateRiskPrediction(weather, time, roadType, trafficDensity, speed, visibility);

    // Display results
    displayPredictionResult(riskData);

    // Update statistics
    updateStatistics(riskData.riskLevel);

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
}

// ML Model Simulation - Replace this with actual model when available
function calculateRiskPrediction(weather, time, roadType, trafficDensity, speed, visibility) {
    let riskScore = 0;
    let riskFactors = [];

    // Weather impact (0-30 points)
    const weatherScores = {
        'clear': 5,
        'cloudy': 10,
        'rainy': 25,
        'foggy': 30,
        'snowy': 35
    };
    riskScore += weatherScores[weather] || 10;
    riskFactors.push(`Weather (${weather}): +${weatherScores[weather]}`);

    // Time of day impact (0-25 points)
    const timeScores = {
        'morning': 8,
        'afternoon': 5,
        'evening': 15,
        'night': 25
    };
    riskScore += timeScores[time] || 10;
    riskFactors.push(`Time (${time}): +${timeScores[time]}`);

    // Road type impact (0-20 points)
    const roadScores = {
        'highway': 20,
        'urban': 15,
        'rural': 25,
        'residential': 10
    };
    riskScore += roadScores[roadType] || 15;
    riskFactors.push(`Road Type (${roadType}): +${roadScores[roadType]}`);

    // Traffic density impact (0-15 points)
    const trafficScores = {
        'light': 5,
        'moderate': 10,
        'heavy': 15,
        'congested': 12 // Congestion reduces speed
    };
    riskScore += trafficScores[trafficDensity] || 10;
    riskFactors.push(`Traffic (${trafficDensity}): +${trafficScores[trafficDensity]}`);

    // Speed impact (0-10 points)
    let speedScore = 0;
    if (speed > 100) {
        speedScore = 10;
    } else if (speed > 80) {
        speedScore = 7;
    } else if (speed > 60) {
        speedScore = 4;
    } else {
        speedScore = 2;
    }
    riskScore += speedScore;
    riskFactors.push(`Speed (${speed} km/h): +${speedScore}`);

    // Visibility impact (inverse - lower visibility = higher risk)
    let visibilityScore = 0;
    if (visibility < 100) {
        visibilityScore = 15;
    } else if (visibility < 300) {
        visibilityScore = 10;
    } else if (visibility < 1000) {
        visibilityScore = 5;
    } else {
        visibilityScore = 0;
    }
    riskScore += visibilityScore;
    riskFactors.push(`Visibility (${visibility}m): +${visibilityScore}`);

    // Normalize to percentage (0-100)
    let probability = Math.min(100, (riskScore / 100) * 100);

    // Add some randomness for realism
    probability += (Math.random() - 0.5) * 10;
    probability = Math.max(0, Math.min(100, probability));

    // Determine risk level
    let riskLevel = 'Low';
    if (probability > 60) {
        riskLevel = 'High';
    } else if (probability > 35) {
        riskLevel = 'Medium';
    }

    // Generate message
    let message = '';
    if (riskLevel === 'High') {
        message = '⚠ CAUTION: Current conditions pose significant accident risk. Reduce speed and stay alert.';
    } else if (riskLevel === 'Medium') {
        message = '⚠ WARNING: Moderate accident risk detected. Drive carefully and maintain safe distance.';
    } else {
        message = '✓ SAFE: Low accident risk. Conditions are favorable for safe driving.';
    }

    return {
        riskLevel: riskLevel,
        probability: probability,
        riskScore: riskScore,
        message: message,
        factors: riskFactors
    };
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
    riskMessage.innerHTML = `
        <strong>Assessment:</strong> ${riskData.message} <br><br>
        <strong>Risk Factors:</strong><br>
        ${riskData.factors.join('<br>')}
    `;

    // Show result container
    resultContainer.classList.remove('hidden');

    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Statistics Management
function updateStatistics(riskLevel) {
    let stats = JSON.parse(localStorage.getItem('predictionStats')) || {
        totalPredictions: 0,
        highRiskCount: 0,
        totalRiskScore: 0
    };

    stats.totalPredictions++;
    if (riskLevel === 'High') {
        stats.highRiskCount++;
    }

    localStorage.setItem('predictionStats', JSON.stringify(stats));
    loadStatistics();
}

function loadStatistics() {
    const stats = JSON.parse(localStorage.getItem('predictionStats')) || {
        totalPredictions: 0,
        highRiskCount: 0,
        totalRiskScore: 0
    };

    document.getElementById('totalPredictions').textContent = stats.totalPredictions;
    document.getElementById('highRiskCount').textContent = stats.highRiskCount;

    const averageRisk = stats.totalPredictions > 0 
        ? ((stats.highRiskCount / stats.totalPredictions) * 100).toFixed(1)
        : 0;
    
    document.getElementById('averageRisk').textContent = averageRisk + '%';
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
