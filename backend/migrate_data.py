#!/usr/bin/env python3
"""
Migration script to load fundraising data from JSON file into the database.
Run this once to populate the database with existing data.
"""

import json
import os
from app import app, db, FundraisingRecord

def migrate_json_to_db(json_file_path):
    """Load data from JSON file and insert into database"""
    
    # Check if file exists
    if not os.path.exists(json_file_path):
        print(f"❌ Error: JSON file not found at {json_file_path}")
        return False
    
    # Load JSON data
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"📄 Loaded {len(data)} records from {json_file_path}")
    except Exception as e:
        print(f"❌ Error loading JSON file: {e}")
        return False
    
    # Create database tables
    with app.app_context():
        print("🔧 Creating database tables...")
        db.create_all()
        
        # Check if database already has data
        existing_count = FundraisingRecord.query.count()
        if existing_count > 0:
            response = input(f"⚠️  Database already has {existing_count} records. Clear and reload? (yes/no): ")
            if response.lower() == 'yes':
                print("🗑️  Clearing existing data...")
                FundraisingRecord.query.delete()
                db.session.commit()
            else:
                print("❌ Migration cancelled.")
                return False
        
        # Insert records
        print("📥 Inserting records into database...")
        success_count = 0
        error_count = 0
        
        for record_data in data:
            try:
                record = FundraisingRecord.from_dict(record_data)
                db.session.add(record)
                success_count += 1
            except Exception as e:
                print(f"⚠️  Error inserting record: {record_data}")
                print(f"   Error: {e}")
                error_count += 1
        
        # Commit all changes
        try:
            db.session.commit()
            print(f"✅ Successfully migrated {success_count} records!")
            if error_count > 0:
                print(f"⚠️  {error_count} records failed to migrate")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error committing to database: {e}")
            return False

if __name__ == '__main__':
    # Path to your JSON file
    json_file = '../frontend/src/data/fundraising-data.json'
    
    print("🌼 Pissenlits Fundraising - Data Migration")
    print("=" * 50)
    
    success = migrate_json_to_db(json_file)
    
    if success:
        # Verify the migration
        with app.app_context():
            total_records = FundraisingRecord.query.count()
            print(f"\n📊 Database now contains {total_records} records")
            
            # Show a sample record
            sample = FundraisingRecord.query.first()
            if sample:
                print("\n📝 Sample record:")
                print(json.dumps(sample.to_dict(), indent=2, ensure_ascii=False))
    else:
        print("\n❌ Migration failed!")

