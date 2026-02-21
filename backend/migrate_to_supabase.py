#!/usr/bin/env python3
"""
Migration script to load fundraising data from backup JSON file into Supabase database.
This script uses the export backup file to populate the Supabase database.
"""

import json
import os
from app import app, db, FundraisingRecord

def migrate_backup_to_supabase(json_file_path):
    """Load data from backup JSON file and insert into Supabase database"""
    
    # Check if file exists
    if not os.path.exists(json_file_path):
        print(f"❌ Error: JSON file not found at {json_file_path}")
        return False
    
    # Load JSON data
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"📄 Loaded {len(data)} records from backup file")
    except Exception as e:
        print(f"❌ Error loading JSON file: {e}")
        return False
    
    # Create database tables
    with app.app_context():
        print("🔧 Creating database tables in Supabase...")
        print(f"🔗 Database: {app.config['SQLALCHEMY_DATABASE_URI'][:60]}...")
        
        try:
            db.create_all()
            print("✅ Tables created successfully!")
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
            return False
        
        # Check if database already has data
        existing_count = FundraisingRecord.query.count()
        if existing_count > 0:
            print(f"⚠️  Database already has {existing_count} records.")
            response = input(f"   Clear and reload? (yes/no): ")
            if response.lower() == 'yes':
                print("🗑️  Clearing existing data...")
                FundraisingRecord.query.delete()
                db.session.commit()
            else:
                print("❌ Migration cancelled.")
                return False
        
        # Insert records
        print("📥 Inserting records into Supabase database...")
        success_count = 0
        error_count = 0
        
        for record_data in data:
            try:
                record = FundraisingRecord.from_dict(record_data)
                db.session.add(record)
                success_count += 1
            except Exception as e:
                print(f"⚠️  Error inserting record: {record_data.get('date', 'unknown')}")
                print(f"   Error: {e}")
                error_count += 1
        
        # Commit all changes
        try:
            db.session.commit()
            print(f"✅ Successfully migrated {success_count} records to Supabase!")
            if error_count > 0:
                print(f"⚠️  {error_count} records failed to migrate")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error committing to database: {e}")
            return False

if __name__ == '__main__':
    # Path to your backup file
    backup_file = 'export_20260214_092232.json'
    
    print("🌼 Pissenlits Fundraising - Migrate to Supabase")
    print("=" * 60)
    print("")
    
    success = migrate_backup_to_supabase(backup_file)
    
    if success:
        # Verify the migration
        with app.app_context():
            total_records = FundraisingRecord.query.count()
            print(f"\n📊 Supabase database now contains {total_records} records")
            
            # Show a sample record
            sample = FundraisingRecord.query.first()
            if sample:
                print("\n📝 Sample record:")
                print(json.dumps(sample.to_dict(), indent=2, ensure_ascii=False))
            
            print("\n✅ Migration to Supabase completed successfully!")
            print("🎉 Your database is now hosted on Supabase (free forever!)")
    else:
        print("\n❌ Migration failed!")

