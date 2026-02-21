#!/usr/bin/env python3
"""
Test script to verify Supabase connection
"""

import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

print("🔗 Testing Supabase connection...")
print(f"📊 Connection string: {DATABASE_URL[:60]}...")
print("")

try:
    # Try to connect with explicit parameters
    # Parse the connection string
    import urllib.parse as urlparse
    url = urlparse.urlparse(DATABASE_URL)

    print("🔧 Attempting connection with explicit parameters...")
    conn = psycopg2.connect(
        database=url.path[1:],
        user=url.username,
        password=url.password,
        host=url.hostname,
        port=url.port
    )
    print("✅ Connection successful!")
    
    # Try to execute a simple query
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print(f"📊 PostgreSQL version: {version[0][:80]}...")
    
    cursor.close()
    conn.close()
    
    print("\n✅ Supabase connection test passed!")
    print("🎉 You can now run the migration script")
    
except Exception as e:
    print(f"❌ Connection failed: {e}")
    print("\n💡 Troubleshooting:")
    print("   1. Verify your connection string in Supabase dashboard")
    print("   2. Make sure your password is correct")
    print("   3. Check if your IP is allowed (Supabase usually allows all IPs)")
    print("   4. Try using the 'Session mode' connection string instead")

