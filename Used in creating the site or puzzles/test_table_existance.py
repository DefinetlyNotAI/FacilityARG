import psycopg2

url = "insert your database url here"

conn = psycopg2.connect(url)
cur = conn.cursor()

# Select all rows from the table
cur.execute("SELECT * FROM actions;")
rows = cur.fetchall()

# Print column names with values
colnames = [desc[0] for desc in cur.description]
for row in rows:
    print(dict(zip(colnames, row)))

cur.close()
conn.close()
