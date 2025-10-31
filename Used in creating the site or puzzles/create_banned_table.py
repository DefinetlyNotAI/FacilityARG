# create_banned_table.py
import os
from pathlib import Path
from dotenv import load_dotenv
import psycopg2

# Load .env.local
env_path = Path(__file__).parent / ".env.local"
load_dotenv(dotenv_path=env_path)

POSTGRES_URL = os.getenv("POSTGRES_URL")

if not POSTGRES_URL:
    print("POSTGRES_URL not found in .env.local")
    exit(1)

# Connect and create table
try:
    with psycopg2.connect(POSTGRES_URL) as conn:
        conn.autocommit = True  # <--- set autocommit after connecting
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS banned (
                    id SERIAL PRIMARY KEY,
                    ip TEXT UNIQUE NOT NULL,
                    reason TEXT,
                    created_at TIMESTAMPTZ DEFAULT now()
                );
            """)
            print("Table `banned` ensured")
except psycopg2.Error as e:
    print("Failed to create banned table:", e)
    exit(1)
