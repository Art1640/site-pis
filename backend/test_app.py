import pytest
import json
import os
from app import app, load_data, save_data

@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def sample_data():
    """Sample data for testing."""
    return [
        {
            "Date": "2025-09-01",
            "Nom": "Test User",
            "Activité": "Test Activity",
            "Détails": "Test details",
            "Montant": 100.0,
            "Qui": "Test Responsible"
        },
        {
            "Date": "2025-09-02",
            "Nom": "Test User 2",
            "Activité": "Test Activity 2",
            "Détails": "Test details 2",
            "Montant": 150.0,
            "Qui": "Test Responsible 2"
        }
    ]

def test_get_records(client, sample_data, tmp_path):
    """Test the /api/records endpoint."""
    # Create a temporary data file
    test_data_file = tmp_path / "test_data.json"
    with open(test_data_file, 'w', encoding='utf-8') as f:
        json.dump(sample_data, f, ensure_ascii=False, indent=2)
    
    # Temporarily replace the data file
    original_data_file = app.config.get('DATA_FILE', 'data.json')
    app.config['DATA_FILE'] = str(test_data_file)
    
    try:
        response = client.get('/api/records')
        assert response.status_code == 200
        
        data = response.get_json()
        assert len(data) == 2
        assert data[0]['Nom'] == 'Test User'
        assert data[1]['Montant'] == 150.0
    finally:
        app.config['DATA_FILE'] = original_data_file

def test_get_summary(client, sample_data, tmp_path):
    """Test the /api/summary endpoint."""
    # Create a temporary data file
    test_data_file = tmp_path / "test_data.json"
    with open(test_data_file, 'w', encoding='utf-8') as f:
        json.dump(sample_data, f, ensure_ascii=False, indent=2)
    
    # Temporarily replace the data file
    original_data_file = app.config.get('DATA_FILE', 'data.json')
    app.config['DATA_FILE'] = str(test_data_file)
    
    try:
        response = client.get('/api/summary')
        assert response.status_code == 200
        
        data = response.get_json()
        assert 'total_funds' in data
        assert 'person_totals' in data
        assert 'activity_totals' in data
        assert 'activity_counts' in data
        assert 'cumulative_data' in data
        
        assert data['total_funds'] == 250.0
        assert data['person_totals']['Test User'] == 100.0
        assert data['person_totals']['Test User 2'] == 150.0
        assert data['activity_totals']['Test Activity'] == 100.0
        assert data['activity_counts']['Test Activity'] == 1
        
        # Check cumulative data
        assert len(data['cumulative_data']) == 2
        assert data['cumulative_data'][0]['total'] == 100.0
        assert data['cumulative_data'][1]['total'] == 250.0
    finally:
        app.config['DATA_FILE'] = original_data_file

def test_load_data_file_not_exists():
    """Test load_data when file doesn't exist."""
    # Temporarily set a non-existent file
    original_data_file = 'data.json'
    import app as app_module
    app_module.DATA_FILE = 'non_existent_file.json'
    
    try:
        data = load_data()
        assert data == []
    finally:
        app_module.DATA_FILE = original_data_file

def test_save_and_load_data(tmp_path):
    """Test saving and loading data."""
    test_data = [
        {
            "Date": "2025-09-01",
            "Nom": "Test User",
            "Activité": "Test Activity",
            "Détails": "Test details",
            "Montant": 100.0,
            "Qui": "Test Responsible"
        }
    ]
    
    test_file = tmp_path / "test_save.json"
    
    # Temporarily replace the data file
    import app as app_module
    original_data_file = app_module.DATA_FILE
    app_module.DATA_FILE = str(test_file)
    
    try:
        # Test saving
        result = save_data(test_data)
        assert result is True
        assert test_file.exists()
        
        # Test loading
        loaded_data = load_data()
        assert loaded_data == test_data
    finally:
        app_module.DATA_FILE = original_data_file

def test_cors_headers(client):
    """Test that CORS headers are present."""
    response = client.get('/api/records')
    assert 'Access-Control-Allow-Origin' in response.headers

if __name__ == '__main__':
    pytest.main([__file__])
