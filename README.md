# Premium Safety System - Documentation

A comprehensive web application for accident risk prediction using machine learning and real-time location tracking.

## Features

### 1. **User Authentication**
- Secure login page with hardcoded credentials (for demo)
- Email and password validation
- Session management with localStorage
- **Default Credentials:**
  - Email: `admin@example.com`
  - Password: `password123`

### 2. **Home Page (index.html)**
- **Google Maps Integration**: Interactive map with location tracking
- **Get Current Location**: Use browser geolocation to get real-time location
- **Accident Risk Prediction**: ML-based risk assessment based on:
  - Weather conditions (Clear, Rainy, Foggy, Snowy, Cloudy)
  - Time of day (Morning, Afternoon, Evening, Night)
  - Road type (Highway, Urban, Rural, Residential)
  - Traffic density (Light, Moderate, Heavy, Congested)
  - Average speed (km/h)
  - Visibility (meters)
- **Risk Levels**: Low, Medium, High with visual indicators
- **Safety Statistics**: View predictions history and high-risk alerts

### 3. **Profile Page (profile.html)**
- **Edit Profile Information**:
  - First Name & Last Name
  - Email Address
  - Phone Number
  - Address, City, Zip Code
  - Bio
  - Driver's License Number
  - Vehicle Information
- **Preferences & Settings**:
  - Enable/Disable Risk Notifications
  - Enable/Disable Alert Sounds
  - Location Tracking opt-in
- **Account Management**:
  - Change Password
  - Delete Account
- **Auto-save functionality**

### 4. **Notification System (notifications.js)**
Real-time alerts with:
- **High-Risk Alerts**: Loud beeps, visual notifications, browser notifications
- **Medium-Risk Alerts**: Moderate notification with auto-dismiss
- **Low-Risk Alerts**: Quick confirmation messages
- **Features**:
  - Sound alerts (configurable)
  - Browser notifications (with permission)
  - Toast-style popup messages
  - Auto-dismiss with manual close option

## File Structure

> 🔧 **Mobile optimization:** All pages include mobile viewport meta tags, are touch-friendly, and use flexible layout dimensions. A `favicon.svg`/`favicon.png` is provided for branding on mobile home screens.

## File Structure

```
Premium/
├── index.html              # Main home page with maps & prediction
├── login.html              # Login page
├── register.html           # Fake registration page
├── profile.html            # User profile management
├── dashboard.html          # Welcome dashboard after login
├── styles.css              # Global styles
├── home.js                 # Home page functionality
├── profile.js              # Profile page functionality
└── notifications.js        # Notification system
```

## How to Use

### Mobile Installation (Add to Home Screen)
1. Open the app URL in a mobile browser (e.g. Chrome or Safari).
2. Use the browser menu and select "Add to Home screen" or "Install app".
3. Launch the app from your home screen for a full‑screen experience without browser UI.


### Basic Setup
1. Open `login.html` in a web browser
2. Login with:
   - Email: `admin@example.com`
   - Password: `password123`
3. Explore all features

### Using the Home Page
1. Click "Use Current Location" to get your location on the map
2. Select weather, time, road type, traffic density, speed, and visibility
3. Click "Predict Risk Level" to get accident risk assessment
4. View results with risk percentage and recommendations

### Managing Profile
1. Click "Profile" in the navigation
2. Edit your information
3. Configure preferences
4. Save changes

### High-Risk Notifications
When accident risk is HIGH:
- **Alert sound** plays automatically
- **Red notification** appears in top-right corner
- **Browser notification** if allowed
- **Cannot auto-close** (requires manual action)

## Integration with ML Model

### Current Status
The app currently uses a **simulation-based risk calculation** that mimics ML behavior based on various environmental factors.

### To Integrate Actual ML Model

1. **Upload the ML Model**:
   - Place `accident_risk_model.joblib` in your backend directory

2. **Create a Backend API** (using Flask/Django):
   ```python
   from flask import Flask, request, jsonify
   import joblib
   
   app = Flask(__name__)
   model = joblib.load('accident_risk_model.joblib')
   
   @app.route('/api/predict', methods=['POST'])
   def predict():
       data = request.json
       # Prepare features
       prediction = model.predict([features])
       return jsonify({'probability': float(prediction[0])})
   ```

3. **Update home.js**:
   Replace the `calculateRiskPrediction()` function:
   ```javascript
   async function calculateRiskPrediction(weather, time, roadType, trafficDensity, speed, visibility) {
       const response = await fetch('/api/predict', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
               weather, time, roadType, trafficDensity, speed, visibility
           })
       });
       const data = await response.json();
       return {
           probability: data.probability,
           riskLevel: data.probability > 60 ? 'High' : (data.probability > 35 ? 'Medium' : 'Low'),
           message: generateMessage(data.probability)
       };
   }
   ```

4. **Google Maps API Key**:
   - Get a free API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Replace the placeholder in `index.html`:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE"></script>
   ```

## Data Storage

All user data is stored in `localStorage`:
- `isLoggedIn`: Boolean flag
- `userEmail`: User's email
- `profileData`: User profile information
- `userPreferences`: User settings
- `predictionStats`: Prediction history

## API Endpoints (For Backend Integration)

### Predict Risk
```
POST /api/predict
Headers: Content-Type: application/json

Request Body:
{
    "weather": "rainy",
    "time": "night",
    "roadType": "highway",
    "trafficDensity": "heavy",
    "speed": 85,
    "visibility": 500
}

Response:
{
    "probability": 75.5,
    "riskLevel": "High",
    "confidence": 0.89
}
```

## Browser Requirements

- Modern browser with ES6 support
- Geolocation permission (for location features)
- Notification permission (for alerts)
- JavaScript enabled
- Google Chrome, Firefox, Safari, or Edge (latest versions)

## Security Notes

⚠️ **For Demo Only**:
- Credentials are hardcoded in login.html
- No backend authentication
- All data stored in localStorage (not secure)

For **Production**:
- Use backend authentication with JWT/sessions
- Hash passwords with bcrypt
- Use HTTPS only
- Implement proper database with encryption
- Add CORS security headers
- Implement rate limiting

## Customization

### Change Login Credentials
Edit `login.html`:
```javascript
const VALID_EMAIL = "your_email@example.com";
const VALID_PASSWORD = "your_password";
```

### Customize Risk Thresholds
Edit `home.js` in `calculateRiskPrediction()`:
```javascript
if (probability > 60) {  // Change 60 to your threshold
    riskLevel = 'High';
}
```

### Change Color Scheme
Edit `styles.css`:
```css
/* Change primary color */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Google Maps not showing | Add your API key or use Chrome localhost access |
| Geolocation not working | Allow location permission or allow HTTPS |
| Notifications not showing | Grant notification permission in browser settings |
| Login fails | Verify email and password match (admin@example.com / password123) |

## Contributing

To enhance this system:
1. Add real database (MongoDB, PostgreSQL)
2. Implement backend API with Node.js/Python
3. Add weather API integration
4. Integrate traffic data APIs
5. Add historical analysis & analytics
6. Implement real-time location tracking
7. Add multi-language support

## License

Developed for Safety Systems Demo - 2026

## Support

For issues or questions, please contact the development team.
