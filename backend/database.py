import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def get_conn():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


def init_db():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS workout_logs (
            id SERIAL PRIMARY KEY,
            date TEXT NOT NULL UNIQUE,
            session_type TEXT,
            session_name TEXT,
            body_weight REAL,
            notes TEXT,
            completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS exercise_logs (
            id SERIAL PRIMARY KEY,
            date TEXT NOT NULL,
            exercise_index INTEGER NOT NULL,
            exercise_name TEXT NOT NULL,
            actual_sets INTEGER,
            actual_reps INTEGER,
            actual_weight REAL,
            rpe INTEGER,
            done BOOLEAN DEFAULT FALSE,
            UNIQUE(date, exercise_index)
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS weekly_weight (
            id SERIAL PRIMARY KEY,
            week_number INTEGER NOT NULL UNIQUE,
            weigh_date TEXT,
            body_weight REAL,
            notes TEXT,
            logged_at TIMESTAMP DEFAULT NOW()
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS monthly_checkin (
            id SERIAL PRIMARY KEY,
            month_number INTEGER NOT NULL UNIQUE,
            body_weight REAL,
            notes TEXT,
            logged_at TIMESTAMP DEFAULT NOW()
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS strength_logs (
            id SERIAL PRIMARY KEY,
            month_number INTEGER NOT NULL,
            exercise_name TEXT NOT NULL,
            working_weight REAL,
            notes TEXT,
            logged_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(month_number, exercise_name)
        )
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("DB initialized")
