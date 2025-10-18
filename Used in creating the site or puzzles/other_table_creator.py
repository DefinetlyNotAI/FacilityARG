import psycopg2

POSTGRES_URL = "insert url here"

TABLE_QUERIES = [
    """
    CREATE TABLE IF NOT EXISTS ip_records (
        ip INET PRIMARY KEY,
        first_seen_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        last_seen_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        banned BOOLEAN DEFAULT FALSE NOT NULL,
        banned_at TIMESTAMPTZ,
        ban_scope VARCHAR(64),
        cookie_value VARCHAR(256),
        note TEXT
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS task_participation (
        id SERIAL PRIMARY KEY,
        ip INET NOT NULL,
        task_type VARCHAR(32) NOT NULL,
        opted_in BOOLEAN DEFAULT FALSE NOT NULL,
        pressed BOOLEAN DEFAULT FALSE NOT NULL,
        uploaded_filename VARCHAR(255),
        uploaded_words TEXT[],
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        UNIQUE(ip, task_type)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS ban_log (
        id BIGSERIAL PRIMARY KEY,
        ip INET NOT NULL,
        reason VARCHAR(255) NOT NULL,
        scope VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS game_state (
        key VARCHAR(128) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS rewards (
        id SERIAL PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        lore_drop TEXT,
        revealed BOOLEAN DEFAULT FALSE NOT NULL,
        revealed_at TIMESTAMPTZ
    );
    """
]

def main():
    try:
        conn = psycopg2.connect(POSTGRES_URL)
        conn.autocommit = True
        cur = conn.cursor()

        for query in TABLE_QUERIES:
            cur.execute(query)

        print("Tables created successfully.")

        cur.close()
        conn.close()
    except Exception as e:
        print("Error creating tables:", e)

if __name__ == "__main__":
    main()
