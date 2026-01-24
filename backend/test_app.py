import pytest
import json
import os
from app import app, db, FundraisingRecord

@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    # Use in-memory SQLite for testing
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()

@pytest.fixture
def sample_data():
    """Sample data for testing."""
    return [
        {
            "Date": "2025-09-01",
            "Qui": "Test User",
            "Type": "Test Type",
            "Activité": "Test Activity",
            "Détails": "Test details",
            "Montant": 100.0
        },
        {
            "Date": "2025-09-02",
            "Qui": "Test User 2",
            "Type": "Test Type 2",
            "Activité": "Test Activity 2",
            "Détails": "Test details 2",
            "Montant": 150.0
        }
    ]

@pytest.fixture
def populated_db(client, sample_data):
    """Populate the test database with sample data."""
    with app.app_context():
        for data in sample_data:
            record = FundraisingRecord.from_dict(data)
            db.session.add(record)
        db.session.commit()

def test_get_records_empty(client):
    """Test the /api/records endpoint with empty database."""
    response = client.get('/api/records')
    assert response.status_code == 200
    data = response.get_json()
    assert data == []

def test_get_records(client, populated_db):
    """Test the /api/records endpoint with data."""
    response = client.get('/api/records')
    assert response.status_code == 200

    data = response.get_json()
    assert len(data) == 2
    assert data[0]['Qui'] == 'Test User'
    assert data[1]['Montant'] == 150.0

def test_add_record(client):
    """Test adding a new record."""
    new_record = {
        "Date": "2025-09-03",
        "Qui": "New User",
        "Type": "New Type",
        "Activité": "New Activity",
        "Détails": "New details",
        "Montant": 200.0
    }

    response = client.post('/api/records',
                          data=json.dumps(new_record),
                          content_type='application/json')
    assert response.status_code == 201

    data = response.get_json()
    assert data['Qui'] == 'New User'
    assert data['Montant'] == 200.0

def test_delete_record(client, populated_db):
    """Test deleting a record."""
    delete_data = {
        "Date": "2025-09-01",
        "Qui": "Test User",
        "Activité": "Test Activity"
    }

    response = client.post('/api/records/delete',
                          data=json.dumps(delete_data),
                          content_type='application/json')
    assert response.status_code == 200

    # Verify record was deleted
    response = client.get('/api/records')
    data = response.get_json()
    assert len(data) == 1
    assert data[0]['Qui'] == 'Test User 2'

def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get('/api/health')
    assert response.status_code == 200

    data = response.get_json()
    assert data['status'] == 'healthy'
    assert data['database'] == 'connected'

def test_cors_headers(client):
    """Test that CORS headers are present."""
    response = client.get('/api/records')
    assert 'Access-Control-Allow-Origin' in response.headers

def test_record_to_dict():
    """Test FundraisingRecord.to_dict() method."""
    with app.app_context():
        record = FundraisingRecord(
            date='2025-09-01',
            qui='Test User',
            type='Test Type',
            activite='Test Activity',
            details='Test details',
            montant='100.0'
        )

        result = record.to_dict()
        assert result['Date'] == '2025-09-01'
        assert result['Qui'] == 'Test User'
        assert result['Montant'] == 100.0

def test_record_from_dict():
    """Test FundraisingRecord.from_dict() method."""
    data = {
        "Date": "2025-09-01",
        "Qui": "Test User",
        "Type": "Test Type",
        "Activité": "Test Activity",
        "Détails": "Test details",
        "Montant": 100.0
    }

    record = FundraisingRecord.from_dict(data)
    assert record.date == '2025-09-01'
    assert record.qui == 'Test User'
    assert record.montant == '100.0'

def test_record_with_array_montant():
    """Test handling of array montant values."""
    data = {
        "Date": "2025-09-01",
        "Qui": "Test User",
        "Type": "Test Type",
        "Activité": "Test Activity",
        "Détails": "Test details",
        "Montant": [50.0, 30.0, 20.0]
    }

    record = FundraisingRecord.from_dict(data)
    assert record.montant == '[50.0, 30.0, 20.0]'

    result = record.to_dict()
    assert result['Montant'] == [50.0, 30.0, 20.0]

if __name__ == '__main__':
    pytest.main([__file__])
