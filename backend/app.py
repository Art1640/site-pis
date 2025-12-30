from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime, date
import socket

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
DATA_FILE = 'data.json'

def load_data():
    """Load data from JSON file"""
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            return []
    except Exception as e:
        print(f"Error loading data: {e}")
        return []

def save_data(data):
    """Save data to JSON file"""
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error saving data: {e}")
        return False

@app.route('/api/records', methods=['GET'])
def get_records():
    """Get all fundraising records"""
    try:
        data = load_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve records'}), 500

@app.route('/api/summary', methods=['GET'])
def get_summary():
    """Get aggregated data for charts"""
    try:
        data = load_data()
        
        # Calculate total funds
        total_funds = sum(record['Montant'] for record in data)
        
        # Group by person for leaderboard
        person_totals = {}
        for record in data:
            person = record['Nom']
            if person in person_totals:
                person_totals[person] += record['Montant']
            else:
                person_totals[person] = record['Montant']
        
        # Group by activity
        activity_totals = {}
        activity_counts = {}
        for record in data:
            activity = record['Activité']
            if activity in activity_totals:
                activity_totals[activity] += record['Montant']
                activity_counts[activity] += 1
            else:
                activity_totals[activity] = record['Montant']
                activity_counts[activity] = 1
        
        # Calculate cumulative data by date
        sorted_data = sorted(data, key=lambda x: x['Date'])
        cumulative_data = []
        running_total = 0
        
        for record in sorted_data:
            running_total += record['Montant']
            cumulative_data.append({
                'date': record['Date'],
                'total': running_total
            })
        
        return jsonify({
            'total_funds': total_funds,
            'person_totals': person_totals,
            'activity_totals': activity_totals,
            'activity_counts': activity_counts,
            'cumulative_data': cumulative_data
        })
    except Exception as e:
        return jsonify({'error': 'Failed to generate summary'}), 500

def check_port(port):
    """Check if a port is available"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    return result != 0

def find_available_port(start_port=5000):
    """Find an available port starting from start_port"""
    port = start_port
    while port < start_port + 100:  # Check up to 100 ports
        if check_port(port):
            return port
        port += 1
    return None

if __name__ == '__main__':
    # Check if data file exists, if not create it with sample data
    if not os.path.exists(DATA_FILE):
        print("Creating sample data file...")
        # This will be populated in the next step
        save_data([])
    
    # Find available port
    port = find_available_port(5000)
    if port is None:
        print("No available ports found!")
        exit(1)
    
    print(f"Backend running on http://localhost:{port}")
    app.run(debug=True, host='0.0.0.0', port=port)
