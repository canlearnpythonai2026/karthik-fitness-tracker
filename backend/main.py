from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, timedelta
import os, httpx
from dotenv import load_dotenv
from database import get_conn, init_db
from fitness_data import (
    WEEK_SCHEDULE, MONTH_TARGETS, WEEKLY_TARGETS,
    GYM_EXERCISES, WALK_EXERCISES, CARDIO_EXERCISES,
    EXERCISE_GIF_MAP, get_month, get_week_number, get_gym_toggle, START_DATE
)

load_dotenv()
app = FastAPI(title="Karthik Fitness Tracker API")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Build allowed origins list — supports Vercel preview URLs too
def get_allowed_origins():
    origins = ["http://localhost:3000", "http://localhost:3001"]
    if FRONTEND_URL:
        origins.append(FRONTEND_URL)
    return origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()


# ── MODELS ────────────────────────────────────────────────────────────────
class WorkoutLogIn(BaseModel):
    date: str
    body_weight: Optional[float] = None
    notes: Optional[str] = None
    completed: Optional[bool] = False

class ExerciseLogIn(BaseModel):
    date: str
    exercise_index: int
    exercise_name: str
    actual_sets: Optional[int] = None
    actual_reps: Optional[int] = None
    actual_weight: Optional[float] = None
    rpe: Optional[int] = None
    done: Optional[bool] = False

class WeeklyWeightIn(BaseModel):
    week_number: int
    weigh_date: Optional[str] = None
    body_weight: float
    notes: Optional[str] = None

class MonthlyCheckinIn(BaseModel):
    month_number: int
    body_weight: float
    notes: Optional[str] = None

class StrengthLogIn(BaseModel):
    month_number: int
    exercise_name: str
    working_weight: float
    notes: Optional[str] = None


# ── SCHEDULE HELPER ────────────────────────────────────────────────────────
def build_day_plan(d: date) -> dict:
    dow = d.weekday()
    sched = WEEK_SCHEDULE.get(dow, {"type": "rest", "label": "Rest"})
    month = get_month(d)
    week_num = get_week_number(d)
    session_type = sched["type"]
    exercises = []
    session_name = ""

    if session_type == "gym":
        toggle = get_gym_toggle(d)
        gym_data = GYM_EXERCISES[toggle].get(month, GYM_EXERCISES[toggle][1])
        session_name = {
            1: f"Full Body {toggle}",
            2: f"Full Body {toggle}",
            3: "Upper Body" if toggle == "A" else "Lower Body",
            4: "Upper Body" if toggle == "A" else "Lower Body",
            5: "Push Day" if toggle == "A" else "Pull + Legs",
            6: "Push Day" if toggle == "A" else "Pull + Legs",
        }.get(month, f"Full Body {toggle}")
        exercises = gym_data
    elif session_type == "walk":
        session_name = "Walk + Bodyweight"
        exercises = WALK_EXERCISES
    elif session_type == "cardio":
        session_name = "Cardio + Core"
        exercises = CARDIO_EXERCISES
    else:
        session_name = "Rest Day"

    month_info = MONTH_TARGETS.get(month, {})
    weekly_target = WEEKLY_TARGETS[week_num - 1] if week_num <= len(WEEKLY_TARGETS) else 78.0

    return {
        "date": d.isoformat(),
        "day_name": d.strftime("%A"),
        "formatted_date": d.strftime("%d %b %Y"),
        "session_type": session_type,
        "session_label": sched["label"],
        "session_name": session_name,
        "month": month,
        "week_number": week_num,
        "month_target_weight": month_info.get("weight", 78),
        "weekly_target_weight": weekly_target,
        "phase": month_info.get("phase", ""),
        "exercises": [
            {**ex, "index": i, "gif_id": EXERCISE_GIF_MAP.get(ex["name"].lower(), None)}
            for i, ex in enumerate(exercises)
        ],
        "morning_desc": _morning_desc(session_type, session_name),
        "evening_desc": _evening_desc(session_type),
    }


def _morning_desc(t, name):
    return {"gym": f"Gym — {name} · 1.5 hrs", "walk": "Brisk walk + bodyweight · 1.5 hrs",
            "cardio": "Outdoor jog + core circuit · 1.5 hrs", "rest": "Rest or light 20 min walk"}.get(t, "")

def _evening_desc(t):
    return {"gym": "Brisk walk 20–30 min + stretch", "walk": "Stretch 15 min",
            "cardio": "Walk 20 min + stretch", "rest": ""}.get(t, "")


# ── ROUTES ────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "app": "Karthik Fitness Tracker API"}


@app.get("/api/today")
def get_today():
    return build_day_plan(date.today())


@app.get("/api/day/{date_str}")
def get_day(date_str: str):
    try:
        d = date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(400, "Invalid date format. Use YYYY-MM-DD")
    return build_day_plan(d)


@app.get("/api/week")
def get_week(start: Optional[str] = None):
    d = date.fromisoformat(start) if start else date.today()
    # go to Monday of that week
    monday = d - timedelta(days=d.weekday())
    return [build_day_plan(monday + timedelta(days=i)) for i in range(7)]


@app.get("/api/dashboard")
def get_dashboard():
    conn = get_conn()
    cur = conn.cursor()

    # latest body weight
    cur.execute("SELECT body_weight FROM workout_logs WHERE body_weight IS NOT NULL ORDER BY date DESC LIMIT 1")
    bw_row = cur.fetchone()
    latest_bw = bw_row["body_weight"] if bw_row else None

    # monthly checkins
    cur.execute("SELECT * FROM monthly_checkin ORDER BY month_number")
    monthly = list(cur.fetchall())

    # weekly weights
    cur.execute("SELECT * FROM weekly_weight ORDER BY week_number")
    weekly = list(cur.fetchall())

    # total workouts completed
    cur.execute("SELECT COUNT(*) as cnt FROM workout_logs WHERE completed = TRUE")
    completed_row = cur.fetchone()
    completed = completed_row["cnt"] if completed_row else 0

    cur.close()
    conn.close()

    lost = round(89 - latest_bw, 1) if latest_bw else 0
    pct = round(max(0, min(100, lost / 11 * 100)), 1) if latest_bw else 0

    return {
        "start_weight": 89,
        "target_weight": 78,
        "latest_weight": latest_bw,
        "kg_lost": max(0, lost),
        "progress_pct": pct,
        "workouts_completed": completed,
        "monthly_checkins": monthly,
        "weekly_weights": weekly,
        "month_targets": MONTH_TARGETS,
        "weekly_targets": WEEKLY_TARGETS,
    }


@app.post("/api/workout-log")
def save_workout_log(data: WorkoutLogIn):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO workout_logs (date, body_weight, notes, completed)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (date) DO UPDATE SET
            body_weight = COALESCE(EXCLUDED.body_weight, workout_logs.body_weight),
            notes = COALESCE(EXCLUDED.notes, workout_logs.notes),
            completed = EXCLUDED.completed,
            updated_at = NOW()
        RETURNING *
    """, (data.date, data.body_weight, data.notes, data.completed))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return dict(row)


@app.get("/api/workout-log/{date_str}")
def get_workout_log(date_str: str):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM workout_logs WHERE date = %s", (date_str,))
    row = cur.fetchone()
    cur.execute("SELECT * FROM exercise_logs WHERE date = %s ORDER BY exercise_index", (date_str,))
    exercises = list(cur.fetchall())
    cur.close()
    conn.close()
    return {"log": dict(row) if row else None, "exercises": exercises}


@app.post("/api/exercise-log")
def save_exercise_log(data: ExerciseLogIn):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO exercise_logs (date, exercise_index, exercise_name, actual_sets, actual_reps, actual_weight, rpe, done)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (date, exercise_index) DO UPDATE SET
            actual_sets = EXCLUDED.actual_sets,
            actual_reps = EXCLUDED.actual_reps,
            actual_weight = EXCLUDED.actual_weight,
            rpe = EXCLUDED.rpe,
            done = EXCLUDED.done
        RETURNING *
    """, (data.date, data.exercise_index, data.exercise_name,
          data.actual_sets, data.actual_reps, data.actual_weight, data.rpe, data.done))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return dict(row)


@app.post("/api/weekly-weight")
def save_weekly_weight(data: WeeklyWeightIn):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO weekly_weight (week_number, weigh_date, body_weight, notes)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (week_number) DO UPDATE SET
            body_weight = EXCLUDED.body_weight,
            weigh_date = EXCLUDED.weigh_date,
            notes = EXCLUDED.notes,
            logged_at = NOW()
        RETURNING *
    """, (data.week_number, data.weigh_date, data.body_weight, data.notes))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return dict(row)


@app.post("/api/monthly-checkin")
def save_monthly_checkin(data: MonthlyCheckinIn):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO monthly_checkin (month_number, body_weight, notes)
        VALUES (%s, %s, %s)
        ON CONFLICT (month_number) DO UPDATE SET
            body_weight = EXCLUDED.body_weight,
            notes = EXCLUDED.notes,
            logged_at = NOW()
        RETURNING *
    """, (data.month_number, data.body_weight, data.notes))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return dict(row)


@app.post("/api/strength-log")
def save_strength_log(data: StrengthLogIn):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO strength_logs (month_number, exercise_name, working_weight, notes)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (month_number, exercise_name) DO UPDATE SET
            working_weight = EXCLUDED.working_weight,
            notes = EXCLUDED.notes,
            logged_at = NOW()
        RETURNING *
    """, (data.month_number, data.exercise_name, data.working_weight, data.notes))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return dict(row)


@app.get("/api/strength-log")
def get_strength_logs():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM strength_logs ORDER BY month_number, exercise_name")
    rows = list(cur.fetchall())
    cur.close()
    conn.close()
    return rows


@app.get("/api/exercise-gif/{exercise_name}")
async def get_exercise_gif(exercise_name: str):
    """Proxy ExerciseDB open-source API for exercise GIFs."""
    name_lower = exercise_name.lower()
    gif_id = EXERCISE_GIF_MAP.get(name_lower)
    if not gif_id:
        # search by name
        async with httpx.AsyncClient(timeout=10) as client:
            try:
                resp = await client.get(
                    f"https://exercisedb-api.vercel.app/api/v1/exercises/name/{name_lower.replace(' ', '%20')}",
                )
                if resp.status_code == 200:
                    data = resp.json()
                    exercises = data.get("data", {}).get("exercises", [])
                    if exercises:
                        return {
                            "gif_url": exercises[0].get("gifUrl"),
                            "name": exercises[0].get("name"),
                            "instructions": exercises[0].get("instructions", []),
                            "target": exercises[0].get("targetMuscles", []),
                            "equipment": exercises[0].get("equipments", []),
                        }
            except Exception:
                pass
        raise HTTPException(404, f"No GIF found for: {exercise_name}")

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.get(
                f"https://exercisedb-api.vercel.app/api/v1/exercises/{gif_id}",
            )
            if resp.status_code == 200:
                data = resp.json()
                ex = data.get("data", {})
                return {
                    "gif_url": ex.get("gifUrl"),
                    "name": ex.get("name"),
                    "instructions": ex.get("instructions", []),
                    "target": ex.get("targetMuscles", []),
                    "equipment": ex.get("equipments", []),
                }
        except Exception as e:
            raise HTTPException(503, f"ExerciseDB unavailable: {str(e)}")
    raise HTTPException(404, "Exercise not found")


@app.get("/api/health")
def health():
    return {"status": "healthy", "start_date": START_DATE.isoformat()}
