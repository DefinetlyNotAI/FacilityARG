import psycopg2

url = "insert here your database URL"

conn = psycopg2.connect(url)
cur = conn.cursor()

# Create table Act_I to Act_X as boolean columns
cur.execute("""
    CREATE TABLE IF NOT EXISTS actions (
        Act_I BOOLEAN DEFAULT FALSE,
        Act_II BOOLEAN DEFAULT FALSE,
        Act_III BOOLEAN DEFAULT FALSE,
        Act_IV BOOLEAN DEFAULT FALSE,
        Act_V BOOLEAN DEFAULT FALSE,
        Act_VI BOOLEAN DEFAULT FALSE,
        Act_VII BOOLEAN DEFAULT FALSE,
        Act_VIII BOOLEAN DEFAULT FALSE,
        Act_IX BOOLEAN DEFAULT FALSE,
        Act_X BOOLEAN DEFAULT FALSE
    );
""")

# Insert a row with all False
cur.execute("""
    INSERT INTO actions DEFAULT VALUES;
""")

conn.commit()
cur.close()
conn.close()

print("Table 'actions' created with one row of False values.")
