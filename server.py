from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import joblib
import numpy as np

app = Flask(__name__, static_folder='.')
CORS(app)  # Allow cross-origin requests

# Database setup
def init_db():
    conn = sqlite3.connect('blackspot.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS profiles
                 (email TEXT PRIMARY KEY, data TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS predictions
                 (id INTEGER PRIMARY KEY, email TEXT, data TEXT)''')
    conn.commit()
    conn.close()

init_db()

# Load ML model if exists
MODEL_PATH = 'accident_risk_model.joblib'
model = None
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print("ML model loaded successfully")
    except Exception as e:
        print(f"Failed to load model: {e}")
        model = None

# Serve static files
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# API endpoints
@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    weather = data.get('weather')
    time = data.get('time')
    roadType = data.get('roadType')
    trafficDensity = data.get('trafficDensity')
    speed = float(data.get('speed', 0))
    visibility = float(data.get('visibility', 1000))

    if model:
        # Prepare features (adjust based on your model's training)
        features = [speed, visibility]  # Add more based on model
        # Map categorical to numbers
        weather_map = {'clear': 0, 'rainy': 1, 'foggy': 2, 'snowy': 3, 'cloudy': 4}
        time_map = {'morning': 0, 'afternoon': 1, 'evening': 2, 'night': 3}
        road_map = {'highway': 0, 'urban': 1, 'rural': 2, 'residential': 3}
        traffic_map = {'light': 0, 'moderate': 1, 'heavy': 2, 'congested': 3}

        features.extend([
            weather_map.get(weather, 0),
            time_map.get(time, 0),
            road_map.get(roadType, 0),
            traffic_map.get(trafficDensity, 0)
        ])

        prediction = model.predict_proba([features])[0][1] * 100  # Assuming binary classification
    else:
        # Fallback simulation
        base_risk = 20
        if weather in ['rainy', 'foggy', 'snowy']: base_risk += 20
        if time == 'night': base_risk += 15
        if roadType == 'highway': base_risk += 10
        if trafficDensity in ['heavy', 'congested']: base_risk += 15
        if speed > 80: base_risk += 10
        if visibility < 500: base_risk += 10
        prediction = min(base_risk, 100)

    risk_level = 'High' if prediction > 60 else 'Medium' if prediction > 35 else 'Low'
    return jsonify({
        'probability': round(prediction, 1),
        'riskLevel': risk_level,
        'message': f'Risk level: {risk_level}. Probability: {round(prediction, 1)}%'
    })

@app.route('/api/save-profile', methods=['POST'])
def save_profile():
    data = request.json
    email = data.get('email')
    profile_data = data.get('data')
    if not email or not profile_data:
        return jsonify({'error': 'Missing email or data'}), 400

    conn = sqlite3.connect('blackspot.db')
    c = conn.cursor()
    c.execute('INSERT OR REPLACE INTO profiles (email, data) VALUES (?, ?)',
              (email, str(profile_data)))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/load-profile', methods=['GET'])
def load_profile():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Missing email'}), 400

    conn = sqlite3.connect('blackspot.db')
    c = conn.cursor()
    c.execute('SELECT data FROM profiles WHERE email = ?', (email,))
    row = c.fetchone()
    conn.close()
    if row:
        return jsonify(eval(row[0]))  # Assuming data is dict string
    return jsonify({})

@app.route('/api/save-prediction', methods=['POST'])
def save_prediction():
    data = request.json
    email = data.get('email')
    prediction_data = data.get('data')
    if not email or not prediction_data:
        return jsonify({'error': 'Missing email or data'}), 400

    conn = sqlite3.connect('blackspot.db')
    c = conn.cursor()
    c.execute('INSERT INTO predictions (email, data) VALUES (?, ?)',
              (email, str(prediction_data)))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/load-predictions', methods=['GET'])
def load_predictions():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Missing email'}), 400

    conn = sqlite3.connect('blackspot.db')
    c = conn.cursor()
    c.execute('SELECT data FROM predictions WHERE email = ? ORDER BY id DESC', (email,))
    rows = c.fetchall()
    conn.close()
    predictions = [eval(row[0]) for row in rows]
    return jsonify(predictions)

@app.route('/upload-model', methods=['POST'])
def upload_model():
    if 'model' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['model']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    file.save(MODEL_PATH)
    global model
    try:
        model = joblib.load(MODEL_PATH)
        return jsonify({'success': 'Model uploaded and loaded'})
    except Exception as e:
        return jsonify({'error': f'Failed to load model: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
