from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import json
import os
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database Configuration
# Use PostgreSQL in production (Render), SQLite for local development
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
    # Render uses postgres:// but SQLAlchemy needs postgresql://
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL or 'sqlite:///fundraising.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

print(f"🔧 Initializing database with URI: {app.config['SQLALCHEMY_DATABASE_URI'][:50]}...")

try:
    db = SQLAlchemy(app)
    print("✅ SQLAlchemy initialized successfully")
except Exception as e:
    print(f"❌ Error initializing SQLAlchemy: {e}")
    raise

# Database Model
class FundraisingRecord(db.Model):
    __tablename__ = 'fundraising_records'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), nullable=False)  # YYYY-MM-DD format
    qui = db.Column(db.String(500), nullable=False)  # Can have multiple names
    type = db.Column(db.String(100), nullable=False)
    activite = db.Column(db.String(200), nullable=False)
    details = db.Column(db.Text, default='')
    montant = db.Column(db.Text, nullable=False)  # Store as JSON string (can be number or array)

    def to_dict(self):
        """Convert database record to dictionary matching frontend format"""
        # Parse montant - it can be a number or an array
        try:
            montant_parsed = json.loads(self.montant)
        except (json.JSONDecodeError, TypeError):
            # If it's already a number, use it directly
            montant_parsed = float(self.montant) if self.montant else 0

        return {
            'Date': self.date,
            'Qui': self.qui,
            'Type': self.type,
            'Activité': self.activite,
            'Détails': self.details,
            'Montant': montant_parsed
        }

    @staticmethod
    def from_dict(data):
        """Create database record from dictionary"""
        # Convert montant to JSON string if it's an array, otherwise store as string
        montant = data.get('Montant', 0)
        if isinstance(montant, list):
            montant_str = json.dumps(montant)
        else:
            montant_str = str(montant)

        return FundraisingRecord(
            date=data.get('Date', ''),
            qui=data.get('Qui', ''),
            type=data.get('Type', ''),
            activite=data.get('Activité', ''),
            details=data.get('Détails', ''),
            montant=montant_str
        )

@app.route('/api/records', methods=['GET'])
def get_records():
    """Get all fundraising records"""
    try:
        records = FundraisingRecord.query.all()
        return jsonify([record.to_dict() for record in records])
    except Exception as e:
        print(f"Error retrieving records: {e}")
        return jsonify({'error': 'Failed to retrieve records'}), 500

@app.route('/api/records', methods=['POST'])
def add_record():
    """Add a new fundraising record"""
    try:
        data = request.get_json()
        new_record = FundraisingRecord.from_dict(data)
        db.session.add(new_record)
        db.session.commit()
        return jsonify(new_record.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding record: {e}")
        return jsonify({'error': 'Failed to add record'}), 500

@app.route('/api/records/<int:record_id>', methods=['PUT'])
def update_record(record_id):
    """Update an existing fundraising record"""
    try:
        record = FundraisingRecord.query.get_or_404(record_id)
        data = request.get_json()

        record.date = data.get('Date', record.date)
        record.qui = data.get('Qui', record.qui)
        record.type = data.get('Type', record.type)
        record.activite = data.get('Activité', record.activite)
        record.details = data.get('Détails', record.details)

        montant = data.get('Montant', record.montant)
        if isinstance(montant, list):
            record.montant = json.dumps(montant)
        else:
            record.montant = str(montant)

        db.session.commit()
        return jsonify(record.to_dict())
    except Exception as e:
        db.session.rollback()
        print(f"Error updating record: {e}")
        return jsonify({'error': 'Failed to update record'}), 500

@app.route('/api/records/delete', methods=['POST'])
def delete_record():
    """Delete a fundraising record by matching Date, Qui, and Activité"""
    try:
        data = request.get_json()
        date = data.get('Date')
        qui = data.get('Qui')
        activite = data.get('Activité')

        # Find and delete the matching record
        record = FundraisingRecord.query.filter_by(
            date=date,
            qui=qui,
            activite=activite
        ).first()

        if record:
            db.session.delete(record)
            db.session.commit()
            return jsonify({'message': 'Record deleted successfully'})
        else:
            return jsonify({'error': 'Record not found'}), 404
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting record: {e}")
        return jsonify({'error': 'Failed to delete record'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'database': 'connected'})

def init_db():
    """Initialize the database"""
    try:
        with app.app_context():
            db.create_all()
            print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        print(f"📊 Database URI: {app.config['SQLALCHEMY_DATABASE_URI'][:50]}...")
        raise

if __name__ == '__main__':
    # Initialize database
    init_db()

    # Get port from environment variable (for Render) or use 5000
    port = int(os.getenv('PORT', 5000))

    print(f"🚀 Backend running on http://localhost:{port}")
    print(f"📊 Database: {app.config['SQLALCHEMY_DATABASE_URI']}")

    # Run the app
    app.run(debug=os.getenv('FLASK_ENV') == 'development', host='0.0.0.0', port=port)
