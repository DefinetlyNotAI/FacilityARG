# TODO RUN SCRIPT AT HOME

import psycopg2
from psycopg2 import sql

# Database connection URL
DATABASE_URL = "url here"

def main():
    try:
        # Connect to the PostgreSQL database
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        cur = conn.cursor()

        # Fetch all column names from the "actions" table
        cur.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'actions'
              AND column_name != 'id';
        """)
        columns = [row[0] for row in cur.fetchall()]

        if not columns:
            print("No columns found in table 'actions'. Exiting.")
            return

        print(f"Converting columns to TEXT: {', '.join(columns)}")

        # Generate and execute ALTER TABLE statements for each column
        for col in columns:
            query = sql.SQL("""
                ALTER TABLE actions
                ALTER COLUMN {col} TYPE TEXT
                USING {col}::TEXT;
            """).format(col=sql.Identifier(col))

            print(f"Executing: ALTER COLUMN {col} TYPE TEXT")
            cur.execute(query)

        # Commit all changes
        conn.commit()
        print("✅ All columns successfully converted to TEXT.")

    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
