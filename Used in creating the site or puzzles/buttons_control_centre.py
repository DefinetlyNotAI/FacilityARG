import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

# Load .env.local (you can rename if needed)
load_dotenv(dotenv_path='.env.local')

POSTGRES_URL = os.getenv('POSTGRES_URL')
if not POSTGRES_URL:
    print("Error: POSTGRES_URL not found in .env.local")
    exit(1)


def connect_db():
    try:
        conn = psycopg2.connect(POSTGRES_URL)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        exit(1)


def get_button_states(conn):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT browser, clicked FROM button_states ORDER BY browser;")
        return cur.fetchall()


def update_button_state(conn, browser, state):
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE button_states SET clicked = %s WHERE browser = %s;",
            (state, browser)
        )
        conn.commit()


def print_menu(states):
    print("\nCurrent button states:")
    for idx, row in enumerate(states, 1):
        status = 'Clicked' if row['clicked'] else 'Not Clicked'
        print(f"{idx}. {row['browser']} - {status}")
    print("0. Exit")


def main():
    conn = connect_db()

    while True:
        states = get_button_states(conn)
        print_menu(states)

        choice = input("\nSelect button to toggle (or 0 to exit): ").strip()
        if choice == '0':
            break

        if not choice.isdigit() or int(choice) < 1 or int(choice) > len(states):
            print("Invalid choice, try again.")
            continue

        idx = int(choice) - 1
        browser = states[idx]['browser']
        current_state = states[idx]['clicked']
        new_state = not current_state

        update_button_state(conn, browser, new_state)
        print(f"Button '{browser}' state updated to {'Clicked' if new_state else 'Not Clicked'}.")

    conn.close()
    print("Exiting...")


if __name__ == "__main__":
    main()
