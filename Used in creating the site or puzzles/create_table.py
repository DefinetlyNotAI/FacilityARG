import psycopg2

# Connection URL
DATABASE_URL = "URL HERE"

# SQL Statements
create_table_sql = """
                   CREATE TABLE IF NOT EXISTS button_states (
                                                                browser VARCHAR PRIMARY KEY,
                                                                clicked BOOLEAN NOT NULL DEFAULT FALSE
                   ); \
                   """

insert_data_sql = """
                  INSERT INTO button_states (browser, clicked) VALUES
                                                                   ('Chrome', FALSE),
                                                                   ('Firefox', FALSE),
                                                                   ('Safari', FALSE),
                                                                   ('Edge', FALSE),
                                                                   ('Opera', FALSE)
                      ON CONFLICT (browser) DO NOTHING; \
                  """

# Connect and execute
try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    cur.execute(create_table_sql)
    cur.execute(insert_data_sql)

    conn.commit()
    print("Table created and data inserted successfully.")

    cur.close()
    conn.close()

except Exception as e:
    print("Error:", e)
