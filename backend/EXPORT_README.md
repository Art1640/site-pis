# 📊 Data Export Scripts

Scripts to export fundraising data from PostgreSQL database to JSON and CSV formats.

## 🚀 Quick Start

### Export from Render Production Database

```bash
cd backend
./export-from-render.sh
```

This will create two timestamped files:
- `export_YYYYMMDD_HHMMSS.json` - JSON format
- `export_YYYYMMDD_HHMMSS.csv` - CSV format (can open in Excel)

### Export from Current Database (from .env)

```bash
cd backend
./export-production-data.sh
```

This uses whatever `DATABASE_URL` is set in your `.env` file.

---

## 📁 Files Created

### JSON Format
```json
[
  {
    "id": 1,
    "Date": "2025-09-19",
    "Qui": "Groupe",
    "Type": "Bar Pi",
    "Activité": "Bar Pi #1",
    "Détails": "Tout le monde présent, grosse caisse, sympa :)",
    "Montant": 150.03
  },
  ...
]
```

### CSV Format
```csv
id,Date,Qui,Type,Activité,Détails,Montant
1,2025-09-19,Groupe,Bar Pi,Bar Pi #1,"Tout le monde présent, grosse caisse, sympa :)",150.03
2,2025-09-20,Ocicat,Vente,Cookies,Dans quartier,65
...
```

**Note:** When `Montant` is an array (multiple amounts), it's stored as JSON in CSV:
```csv
8,2025-10-12,"Chousingha, Charlotte, Adrien, Taguan, Merione",Action,Chaussettes,Vague 1,"[33, 21, 60, 48, 111]"
```

---

## 🛠️ Manual Usage (Python Script)

If you want to use the Python script directly:

```bash
cd backend
source venv/bin/activate  # Activate virtual environment
export DATABASE_URL="postgresql://user:pass@host/database"
python3 export_data.py
```

---

## 📋 Script Details

### `export-from-render.sh`
- **Purpose:** Export from Render production PostgreSQL
- **Database:** Hardcoded production URL
- **Use case:** Quick backup of production data

### `export-production-data.sh`
- **Purpose:** Export from database specified in `.env`
- **Database:** Reads `DATABASE_URL` from `.env` file
- **Use case:** Flexible export (local or production)

### `export_data.py`
- **Purpose:** Core Python script that does the actual export
- **Formats:** JSON and CSV
- **Features:**
  - Handles array `Montant` fields
  - Timestamped filenames
  - Error handling
  - Progress messages

---

## 🔧 Requirements

- Python 3.x
- Virtual environment with dependencies installed
- PostgreSQL connection (or SQLite for local)

Dependencies (already in `requirements.txt`):
- `sqlalchemy`
- `psycopg2-binary` (for PostgreSQL)
- `python-dotenv`

---

## 💡 Use Cases

### 1. **Backup Production Data**
```bash
./export-from-render.sh
# Creates: export_20260214_092232.json and .csv
```

### 2. **Import to Excel**
1. Run export script
2. Open the `.csv` file in Excel
3. All data is properly formatted

### 3. **Data Analysis**
```python
import json

with open('export_20260214_092232.json') as f:
    data = json.load(f)

# Analyze data
total = sum(record['Montant'] for record in data if isinstance(record['Montant'], (int, float)))
print(f"Total: {total}€")
```

### 4. **Migrate to New Database**
1. Export from old database
2. Update `DATABASE_URL` in `.env`
3. Use `migrate_data.py` to import the JSON

---

## ⚠️ Important Notes

1. **Credentials in Scripts**
   - `export-from-render.sh` contains production database credentials
   - **Do NOT commit this file to public repositories**
   - Already in `.gitignore` as `*.sh` files

2. **File Naming**
   - Files are timestamped: `export_YYYYMMDD_HHMMSS.json`
   - Multiple exports won't overwrite each other

3. **Array Handling**
   - JSON: Arrays preserved as `[33, 21, 60]`
   - CSV: Arrays converted to JSON string `"[33, 21, 60]"`

4. **Character Encoding**
   - UTF-8 encoding preserves French characters (é, è, à, etc.)

---

## 🐛 Troubleshooting

### "No module named 'dotenv'"
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### "DATABASE_URL not set"
Make sure your `.env` file has:
```
DATABASE_URL=postgresql://user:pass@host/database
```

### "No such table: fundraising_records"
You're connected to an empty database. Check your `DATABASE_URL`.

### Connection timeout
The Render database might be sleeping. Wait 30 seconds and try again.

---

## 📝 Example Output

```
🌼 Pissenlits Fundraising - Export from Render PostgreSQL
========================================================

🔧 Activating virtual environment...
🔗 Connecting to Render PostgreSQL database...

🌼 Pissenlits Fundraising - Data Export
==================================================

🔗 Connecting to database...
📊 Database: dpg-d5qht56r433s7383q740-a.oregon-postgres.render.com/fundraising_6qql
📥 Fetched 33 records from database

✅ Exported 33 records to export_20260214_092232.json
✅ Exported 33 records to export_20260214_092232.csv

✅ Export complete!

📁 Files created:
   - export_20260214_092232.json
   - export_20260214_092232.csv

✅ Done!
```

