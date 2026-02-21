#!/usr/bin/env python3
"""
Export script to download all data from production PostgreSQL database
Exports to both JSON and CSV formats
Usage: python3 export_data.py
"""

import os
import json
import csv
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

def get_database_url():
    """Get database URL from environment variable"""
    db_url = os.getenv('DATABASE_URL')
    
    if not db_url:
        print("❌ Error: DATABASE_URL not set in .env file")
        print("   Please set DATABASE_URL to your PostgreSQL connection string")
        return None
    
    # Fix postgres:// to postgresql:// if needed (Render compatibility)
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
    
    return db_url

def export_to_json(records, filename='export_data.json'):
    """Export records to JSON file"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(records, f, indent=2, ensure_ascii=False)
        print(f"✅ Exported {len(records)} records to {filename}")
        return True
    except Exception as e:
        print(f"❌ Error exporting to JSON: {e}")
        return False

def export_to_csv(records, filename='export_data.csv'):
    """Export records to CSV file"""
    try:
        if not records:
            print("⚠️  No records to export")
            return False
        
        # Get all field names from the first record
        fieldnames = list(records[0].keys())
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            # Handle Montant field (can be array or number)
            for record in records:
                row = record.copy()
                # Convert Montant to string if it's a list
                if isinstance(row.get('Montant'), list):
                    row['Montant'] = json.dumps(row['Montant'])
                writer.writerow(row)
        
        print(f"✅ Exported {len(records)} records to {filename}")
        return True
    except Exception as e:
        print(f"❌ Error exporting to CSV: {e}")
        return False

def fetch_all_records():
    """Fetch all records from the database"""
    db_url = get_database_url()
    if not db_url:
        return None
    
    try:
        # Create database engine
        engine = create_engine(db_url)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        print(f"🔗 Connecting to database...")
        print(f"📊 Database: {db_url.split('@')[1] if '@' in db_url else 'local'}")
        
        # Query all records
        query = text("""
            SELECT id, date, qui, type, activite, details, montant
            FROM fundraising_records
            ORDER BY date, id
        """)
        
        result = session.execute(query)
        rows = result.fetchall()
        
        print(f"📥 Fetched {len(rows)} records from database")
        
        # Convert to list of dictionaries
        records = []
        for row in rows:
            # Parse montant (stored as JSON string if array, or plain number)
            try:
                montant = json.loads(row.montant)
            except (json.JSONDecodeError, TypeError):
                # If it's not JSON, try to convert to float
                try:
                    montant = float(row.montant)
                except (ValueError, TypeError):
                    montant = row.montant
            
            record = {
                'id': row.id,
                'Date': row.date,
                'Qui': row.qui,
                'Type': row.type,
                'Activité': row.activite,
                'Détails': row.details,
                'Montant': montant
            }
            records.append(record)
        
        session.close()
        return records
        
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        return None

def main():
    """Main export function"""
    print("🌼 Pissenlits Fundraising - Data Export")
    print("=" * 50)
    print()
    
    # Fetch records from database
    records = fetch_all_records()
    
    if records is None:
        print("\n❌ Export failed!")
        return
    
    if len(records) == 0:
        print("\n⚠️  No records found in database")
        return
    
    print()
    
    # Generate timestamped filenames
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    json_filename = f'export_{timestamp}.json'
    csv_filename = f'export_{timestamp}.csv'
    
    # Export to both formats
    json_success = export_to_json(records, json_filename)
    csv_success = export_to_csv(records, csv_filename)
    
    print()
    if json_success or csv_success:
        print("✅ Export complete!")
        print(f"\n📁 Files created:")
        if json_success:
            print(f"   - {json_filename}")
        if csv_success:
            print(f"   - {csv_filename}")
    else:
        print("❌ Export failed!")

if __name__ == '__main__':
    main()

