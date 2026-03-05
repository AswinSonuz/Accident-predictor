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
Black Spot Detector/
├── index.html              # Main home page with maps & prediction
├── login.html              # Login page
├── register.html           # Fake registration page
├── profile.html            # User profile management
├── upload.html             # ML model upload page
├── dashboard.html          # Welcome dashboard after login
├── server.py               # Flask backend server
├── electron-main.js        # Electron main process
├── package.json            # Node.js/Electron config
├── blackspot.db            # SQLite database (created automatically)
├── accident_risk_model.joblib  # Your ML model (upload via upload.html)
├── styles.css              # Global styles
├── home.js                 # Home page functionality
├── profile.js              # Profile page functionality
├── notifications.js        # Notification system
├── manifest.json           # PWA manifest
├── service-worker.js       # PWA service worker
└── favicon.*               # Icons
```

## How to Use

### Option 1: Web App (PWA)
1. Install Python dependencies: `pip install flask flask-cors joblib`
2. Run the server: `python server.py`
3. Open `http://localhost:5000` in your browser
4. Login with `admin@example.com` / `password123`
5. **Android:** open in Chrome/Edge, select menu → "Add to Home screen"; the PWA will install and run full‑screen like a native app.
6. **iOS:** open in Safari, tap Share → "Add to Home Screen".

To go beyond the built‑in browser install you can wrap the PWA:

*Using Capacitor (recommended for Android):*
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Black Spot Detector" com.example.blackspot
# after building your web files or pointing to localhost
npx cap add android
npx cap open android  # opens Android Studio to build APK
```
This produces a real `apk` or produces an APK via Android Studio.

*Alternatively*, use online PWA-to-APK services such as [PWABuilder](https://www.pwabuilder.com/) or [PWA2APK](https://www.pwa2apk.com/).

### Option 2: Desktop App
1. Install Node.js and Python dependencies
2. Install Electron: `npm install`
3. Run the desktop app: `npm start`
4. The app will start the Python server automatically and open in a window

### Building Installable Desktop App
1. Install electron-builder: `npm install -g electron-builder`
2. Build for your platform: `npm run dist`
3. Find the installer in the `dist` folder

### Uploading Your ML Model
1. Train your accident risk prediction model and save as `accident_risk_model.joblib`
2. In the web app, go to `http://localhost:5000/upload.html` (or in desktop app, navigate to upload.html)
3. Upload the `.joblib` file
4. The app will now use your model for predictions

### Mobile Installation (Add to Home Screen)
1. Open the app URL in a mobile browser (e.g. Chrome or Safari).
2. Use the browser menu and select "Add to Home screen" or "Install app".
3. Launch the app from your home screen for a full‑screen experience without browser UI.

### Laptop/Desktop Data Sync and Model Upload
The stand‑alone demo currently stores everything in `localStorage`, which only lives on the device where the user interacts with the site. To support adding data from one machine (e.g. your laptop) and having it automatically update on another computer, you'll need a simple backend with persistent storage and endpoints that the front‑end can call.

1. **Backend API**
   - Pick a language/framework (Node.js/Express, Python/Flask, etc.) and a database (MongoDB, PostgreSQL, SQLite, etc.).
   - Create endpoints such as:
     ```
     POST /api/save-profile      # save or update profile data
     GET  /api/profile?email=... # fetch profile data
     POST /api/save-prediction   # append a new prediction entry
     GET  /api/predictions?email=... # retrieve history
     ```
   - Each endpoint reads/writes to the database so that all clients see the same state.
   - Add CORS headers if your front‑end is served from a different origin.

2. **Front‑end modifications**
   - Replace all `localStorage` reads/writes in `home.js`, `profile.js` and other scripts with `fetch` calls to the corresponding API endpoints. Example:
     ```javascript
     async function loadProfile(email) {
         const res = await fetch(`/api/profile?email=${encodeURIComponent(email)}`);
         return res.ok ? res.json() : null;
     }

     async function savePrediction(entry) {
         await fetch('/api/save-prediction', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(entry)
         });
     }
     ```
   - When the user logs in on a second device, the front‑end can fetch the latest profile and prediction history automatically.

3. **Model upload**
   - Add a simple file upload page or form to the backend where you can POST your `accident_risk_model.joblib`. For example, using Flask:
     ```python
     @app.route('/upload-model', methods=['POST'])
     def upload_model():
         f = request.files['model']
         f.save('accident_risk_model.joblib')
         return 'OK', 200
     ```
   - The prediction API (`/api/predict`) should load the model from disk at startup (as shown in the existing README) and use it to answer requests from any client.
   - Once the file is uploaded, every connected computer will use the updated model automatically, since they all call the same server.

4. **Automatic updates between devices**
   - Clients can poll the server for new data or use WebSockets/Server‑Sent Events for real‑time pushes. Polling every few minutes is easiest.
   - Example in `home.js`:
     ```javascript
     setInterval(async () => {
       const stats = await fetch(`/api/predictions?email=${userEmail}`).then(r => r.json());
       updateStatsUI(stats);
     }, 300000); // 5 minutes
     ```

By moving storage and model hosting to a central server, any change made on one device is immediately retrievable from another, and you can upload your trained ML model once and have all clients use it.


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
The app now includes a Flask backend (`server.py`) that can load your `accident_risk_model.joblib` file. If no model is uploaded, it falls back to simulation.

### To Integrate Your ML Model

1. **Train and Save Your Model**:
   ```python
   import joblib
   from sklearn.ensemble import RandomForestClassifier
   # ... train your model ...
   joblib.dump(model, 'accident_risk_model.joblib')
   ```

2. **Upload the Model**:
   - Start the server: `python server.py`
   - Go to `http://localhost:5000/upload.html`
   - Upload your `accident_risk_model.joblib` file
   - The server will load it automatically

3. **Model Input Format**:
   The server expects features in this order: `[speed, visibility, weather_encoded, time_encoded, road_encoded, traffic_encoded]`
   - Weather: clear=0, rainy=1, foggy=2, snowy=3, cloudy=4
   - Time: morning=0, afternoon=1, evening=2, night=3
   - Road: highway=0, urban=1, rural=2, residential=3
   - Traffic: light=0, moderate=1, heavy=2, congested=3

4. **Test Predictions**:
   - Make predictions on the home page
   - Data syncs across devices via the database
   - View stats and history

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
