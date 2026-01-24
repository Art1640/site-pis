#!/usr/bin/env python3
import os
import sys

# Set the DATABASE_URL
os.environ['DATABASE_URL'] = 'postgresql://fundraising_6qql_user:GfV7AkHA9YDfhPUvSxaxBQ16xniJ6J2X@dpg-d5qht56r433s7383q740-a/fundraising_6qql'

print("🌼 Quick Migration Script")
print("=" * 50)
print(f"DATABASE_URL set: {os.environ['DATABASE_URL'][:50]}...")

# Now import and run the migration
from migrate_data import migrate_json_to_db

json_file = '../frontend/src/data/fundraising-data.json'
print(f"\nMigrating from: {json_file}")

success = migrate_json_to_db(json_file)

if success:
    print("\n✅ Migration completed successfully!")
else:
    print("\n❌ Migration failed!")
    sys.exit(1)

