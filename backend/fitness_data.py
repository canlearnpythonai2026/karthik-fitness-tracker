from datetime import date, timedelta

START_DATE = date(2025, 7, 7)  # First Monday

# ExerciseDB exercise name mappings (name -> exercisedb id for GIF lookup)
EXERCISE_GIF_MAP = {
    "squats": "0685",
    "barbell squat": "0685",
    "dumbbell chest press": "0192",
    "seated cable row": "0611",
    "dumbbell shoulder press": "0323",
    "leg press": "0392",
    "plank hold": "0447",
    "romanian deadlift": "0560",
    "incline dumbbell press": "0350",
    "lat pulldown": "0382",
    "lateral raises": "0385",
    "walking lunges": "0704",
    "bicycle crunches": "1460",
    "barbell bench press": "0015",
    "pull-ups": "0651",
    "overhead dumbbell press": "0431",
    "dumbbell bicep curls": "0096",
    "tricep pushdown": "0680",
    "face pulls": "1001",
    "leg curl machine": "0389",
    "calf raises": "1368",
    "incline barbell press": "0341",
    "flat dumbbell press": "0192",
    "cable chest fly": "1629",
    "military press": "0432",
    "overhead tricep extension": "0047",
    "weighted pull-ups": "0651",
    "barbell row": "0031",
    "barbell curls": "0031",
    "hammer curls": "0301",
    "mountain climbers": "0630",
    "leg raises": "0450",
    "crunches": "0230",
}

# Week schedule: dow (0=Mon) -> session type
WEEK_SCHEDULE = {
    0: {"type": "gym",    "label": "Gym"},
    1: {"type": "walk",   "label": "Walk"},
    2: {"type": "cardio", "label": "Cardio"},
    3: {"type": "gym",    "label": "Gym"},
    4: {"type": "walk",   "label": "Walk"},
    5: {"type": "cardio", "label": "Cardio"},
    6: {"type": "rest",   "label": "Rest"},
}

MONTH_TARGETS = {
    1: {"weight": 87, "phase": "Foundation", "gym_style": "Full Body A/B · 3×12"},
    2: {"weight": 85, "phase": "Foundation", "gym_style": "Full Body A/B · 3×12"},
    3: {"weight": 83, "phase": "Fat Loss + Strength", "gym_style": "Upper/Lower · 4×10"},
    4: {"weight": 81, "phase": "Fat Loss + Strength", "gym_style": "Upper/Lower · 4×10"},
    5: {"weight": 79, "phase": "Lean Muscle", "gym_style": "Push/Pull-Legs · 4×10"},
    6: {"weight": 78, "phase": "Lean Muscle", "gym_style": "Push/Pull-Legs · 5×8"},
}

WEEKLY_TARGETS = []
for m, info in MONTH_TARGETS.items():
    base = info["weight"]
    drop = 2 if m < 6 else 1
    for w in range(4):
        WEEKLY_TARGETS.append(round(base + drop - (w + 1) * (drop / 4), 1))


def get_month(d: date) -> int:
    diff = (d - START_DATE).days
    return min(6, max(1, diff // 28 + 1))


def get_week_number(d: date) -> int:
    diff = (d - START_DATE).days
    return min(24, max(1, diff // 7 + 1))


def get_gym_toggle(d: date) -> str:
    """Count gym days from start to get A/B toggle."""
    count = 0
    cur = START_DATE
    while cur < d:
        dow = cur.weekday()
        if dow in (0, 3):
            count += 1
        cur += timedelta(days=1)
    return "A" if count % 2 == 0 else "B"


GYM_EXERCISES = {
    "A": {
        1: [
            {"name": "Warm-up: brisk walk/jog", "sets": "1", "reps": "15 min", "weight": "Outdoor", "tips": "Get heart rate up before lifting"},
            {"name": "Squats", "sets": "3", "reps": "12", "weight": "30–40 kg", "tips": "Knees over toes, chest up, exhale on the way up"},
            {"name": "Dumbbell Chest Press", "sets": "3", "reps": "12", "weight": "12–16 kg each", "tips": "Lower slowly, exhale as you push up"},
            {"name": "Seated Cable Row", "sets": "3", "reps": "12", "weight": "30–40 kg", "tips": "Keep back straight, squeeze shoulder blades"},
            {"name": "Dumbbell Shoulder Press", "sets": "3", "reps": "12", "weight": "10–14 kg each", "tips": "Don't arch lower back, exhale pressing up"},
            {"name": "Leg Press", "sets": "3", "reps": "12", "weight": "60–80 kg", "tips": "Feet shoulder-width, don't lock knees at top"},
            {"name": "Plank Hold", "sets": "3", "reps": "30 sec", "weight": "Bodyweight", "tips": "Keep hips level, breathe normally throughout"},
        ],
        2: [
            {"name": "Warm-up: brisk walk/jog", "sets": "1", "reps": "15 min", "weight": "Outdoor", "tips": "Get heart rate up before lifting"},
            {"name": "Squats", "sets": "3", "reps": "12", "weight": "35–45 kg", "tips": "Knees over toes, chest up, exhale on the way up"},
            {"name": "Dumbbell Chest Press", "sets": "3", "reps": "12", "weight": "14–18 kg each", "tips": "Lower slowly, exhale as you push up"},
            {"name": "Seated Cable Row", "sets": "3", "reps": "12", "weight": "35–45 kg", "tips": "Keep back straight, squeeze shoulder blades"},
            {"name": "Dumbbell Shoulder Press", "sets": "3", "reps": "12", "weight": "12–16 kg each", "tips": "Don't arch lower back, exhale pressing up"},
            {"name": "Leg Press", "sets": "3", "reps": "12", "weight": "70–90 kg", "tips": "Feet shoulder-width, don't lock knees at top"},
            {"name": "Plank Hold", "sets": "3", "reps": "40 sec", "weight": "Bodyweight", "tips": "Keep hips level, breathe normally throughout"},
        ],
        3: [
            {"name": "Barbell Bench Press", "sets": "4", "reps": "10", "weight": "40–55 kg", "tips": "Lower bar to chest, exhale pressing up, keep feet flat"},
            {"name": "Pull-ups / Lat Pulldown", "sets": "4", "reps": "10", "weight": "BW / 40–50 kg", "tips": "Full range of motion, squeeze lats at bottom"},
            {"name": "Overhead Dumbbell Press", "sets": "3", "reps": "12", "weight": "14–18 kg each", "tips": "Core tight, exhale pressing overhead"},
            {"name": "Dumbbell Bicep Curls", "sets": "3", "reps": "12", "weight": "10–14 kg each", "tips": "Don't swing — slow controlled curl"},
            {"name": "Tricep Pushdown", "sets": "3", "reps": "12", "weight": "20–30 kg", "tips": "Keep elbows tucked, full extension at bottom"},
            {"name": "Face Pulls", "sets": "3", "reps": "15", "weight": "15–20 kg", "tips": "Pull to forehead level, great for shoulder health"},
            {"name": "Plank Hold", "sets": "3", "reps": "40 sec", "weight": "Bodyweight", "tips": "Keep core braced, breathe steadily"},
        ],
        4: [
            {"name": "Barbell Bench Press", "sets": "4", "reps": "10", "weight": "50–65 kg", "tips": "Control the descent — 2 sec down, explode up"},
            {"name": "Pull-ups / Lat Pulldown", "sets": "4", "reps": "10", "weight": "BW / 45–55 kg", "tips": "Dead hang at top, chest to bar at bottom"},
            {"name": "Overhead Dumbbell Press", "sets": "3", "reps": "12", "weight": "16–20 kg each", "tips": "Exhale pressing up, don't hyperextend back"},
            {"name": "Dumbbell Bicep Curls", "sets": "3", "reps": "12", "weight": "12–16 kg each", "tips": "Supinate at top for full contraction"},
            {"name": "Tricep Pushdown", "sets": "3", "reps": "12", "weight": "25–35 kg", "tips": "Pause at bottom, slow on the way back"},
            {"name": "Face Pulls", "sets": "3", "reps": "15", "weight": "18–22 kg", "tips": "External rotation — protect your rotator cuff"},
            {"name": "Plank Hold", "sets": "3", "reps": "50 sec", "weight": "Bodyweight", "tips": "Squeeze glutes and abs simultaneously"},
        ],
        5: [
            {"name": "Incline Barbell Press", "sets": "4", "reps": "10", "weight": "50–65 kg", "tips": "30-45° incline, lower to upper chest"},
            {"name": "Flat Dumbbell Press", "sets": "4", "reps": "10", "weight": "18–24 kg each", "tips": "Full stretch at bottom, squeeze at top"},
            {"name": "Cable Chest Fly", "sets": "3", "reps": "15", "weight": "10–15 kg each", "tips": "Slight bend in elbows, feel the stretch"},
            {"name": "Military Press", "sets": "4", "reps": "10", "weight": "35–50 kg", "tips": "Bar in front, press overhead, exhale at top"},
            {"name": "Lateral Raises", "sets": "3", "reps": "15", "weight": "8–12 kg each", "tips": "Lead with elbows, don't shrug shoulders"},
            {"name": "Overhead Tricep Extension", "sets": "3", "reps": "12", "weight": "20–30 kg", "tips": "Keep elbows close to head, full extension"},
        ],
        6: [
            {"name": "Incline Barbell Press", "sets": "5", "reps": "8", "weight": "60–75 kg", "tips": "Progressive overload — add 2.5 kg each week"},
            {"name": "Flat Dumbbell Press", "sets": "4", "reps": "10", "weight": "22–28 kg each", "tips": "Slow eccentric — 3 sec down, explode up"},
            {"name": "Cable Chest Fly", "sets": "3", "reps": "15", "weight": "12–18 kg each", "tips": "Mind-muscle connection — feel every rep"},
            {"name": "Military Press", "sets": "4", "reps": "8", "weight": "45–60 kg", "tips": "Strict form — no leg drive"},
            {"name": "Lateral Raises", "sets": "4", "reps": "15", "weight": "10–14 kg each", "tips": "Drop set on last set for extra pump"},
            {"name": "Overhead Tricep Extension", "sets": "3", "reps": "12", "weight": "25–35 kg", "tips": "Lock elbows tight, only forearms move"},
        ],
    },
    "B": {
        1: [
            {"name": "Warm-up: brisk walk/jog", "sets": "1", "reps": "15 min", "weight": "Outdoor", "tips": "Warm up joints before loading"},
            {"name": "Romanian Deadlift", "sets": "3", "reps": "12", "weight": "40–50 kg", "tips": "Hip hinge — push hips back, slight knee bend, back straight"},
            {"name": "Incline Dumbbell Press", "sets": "3", "reps": "12", "weight": "12–16 kg each", "tips": "30° incline, slow descent, exhale pressing up"},
            {"name": "Lat Pulldown", "sets": "3", "reps": "12", "weight": "35–45 kg", "tips": "Pull to upper chest, lean back slightly"},
            {"name": "Lateral Raises", "sets": "3", "reps": "12", "weight": "6–10 kg each", "tips": "Control the movement, don't use momentum"},
            {"name": "Walking Lunges", "sets": "3", "reps": "12 each leg", "weight": "Bodyweight", "tips": "Step forward, knee nearly touches floor, push back up"},
            {"name": "Bicycle Crunches", "sets": "3", "reps": "20", "weight": "Bodyweight", "tips": "Slow and controlled, full rotation each side"},
        ],
        2: [
            {"name": "Warm-up: brisk walk/jog", "sets": "1", "reps": "15 min", "weight": "Outdoor", "tips": "Warm up joints before loading"},
            {"name": "Romanian Deadlift", "sets": "3", "reps": "12", "weight": "45–55 kg", "tips": "Feel hamstring stretch at bottom"},
            {"name": "Incline Dumbbell Press", "sets": "3", "reps": "12", "weight": "14–18 kg each", "tips": "Control descent, squeeze chest at top"},
            {"name": "Lat Pulldown", "sets": "3", "reps": "12", "weight": "40–50 kg", "tips": "Wide grip, pull to collarbone"},
            {"name": "Lateral Raises", "sets": "3", "reps": "12", "weight": "8–12 kg each", "tips": "Arms parallel to floor at top"},
            {"name": "Walking Lunges", "sets": "3", "reps": "12 each leg", "weight": "8 kg DBs", "tips": "Add light dumbbells for progression"},
            {"name": "Bicycle Crunches", "sets": "3", "reps": "20", "weight": "Bodyweight", "tips": "Exhale each rep, don't pull neck"},
        ],
        3: [
            {"name": "Barbell Squats", "sets": "4", "reps": "10", "weight": "50–65 kg", "tips": "Hip-width stance, break parallel if possible"},
            {"name": "Romanian Deadlift", "sets": "3", "reps": "12", "weight": "50–65 kg", "tips": "Slow hip hinge, feel hamstring stretch"},
            {"name": "Leg Press", "sets": "4", "reps": "10", "weight": "80–100 kg", "tips": "Full depth, don't bounce off the stack"},
            {"name": "Leg Curl Machine", "sets": "3", "reps": "12", "weight": "30–40 kg", "tips": "Curl all the way up, slow descent"},
            {"name": "Walking Lunges", "sets": "3", "reps": "12 each", "weight": "10 kg DBs", "tips": "Long stride, torso upright"},
            {"name": "Calf Raises", "sets": "3", "reps": "15", "weight": "Bodyweight + load", "tips": "Full range — all the way up and down"},
            {"name": "Plank Hold", "sets": "3", "reps": "45 sec", "weight": "Bodyweight", "tips": "Neutral spine, don't let hips sag"},
        ],
        4: [
            {"name": "Barbell Squats", "sets": "4", "reps": "10", "weight": "60–75 kg", "tips": "Brace hard, drive knees out, chest tall"},
            {"name": "Romanian Deadlift", "sets": "3", "reps": "12", "weight": "55–70 kg", "tips": "Feel deep hamstring stretch at bottom"},
            {"name": "Leg Press", "sets": "4", "reps": "10", "weight": "90–110 kg", "tips": "Controlled descent — don't drop the weight"},
            {"name": "Leg Curl Machine", "sets": "3", "reps": "12", "weight": "35–45 kg", "tips": "Pause at top, feel the hamstring contract"},
            {"name": "Walking Lunges", "sets": "3", "reps": "12 each", "weight": "12 kg DBs", "tips": "Steady pace, core tight throughout"},
            {"name": "Calf Raises", "sets": "4", "reps": "15", "weight": "Added load", "tips": "Pause at the top for 1 second"},
            {"name": "Plank Hold", "sets": "3", "reps": "55 sec", "weight": "Bodyweight", "tips": "Squeeze everything — abs, glutes, quads"},
        ],
        5: [
            {"name": "Weighted Pull-ups", "sets": "4", "reps": "8", "weight": "BW + 5–10 kg", "tips": "Full dead hang at top, chest to bar at bottom"},
            {"name": "Barbell Row", "sets": "4", "reps": "10", "weight": "50–65 kg", "tips": "Hinge at hips, pull bar to lower chest"},
            {"name": "Seated Cable Row", "sets": "3", "reps": "12", "weight": "45–55 kg", "tips": "Chest up, pull elbows behind body"},
            {"name": "Barbell Squats", "sets": "4", "reps": "10", "weight": "65–80 kg", "tips": "High bar position, upright torso"},
            {"name": "Leg Press", "sets": "3", "reps": "10", "weight": "100–120 kg", "tips": "Toes slightly pointed out"},
            {"name": "Barbell Curls", "sets": "3", "reps": "12", "weight": "30–40 kg", "tips": "No swinging — strict curl only"},
            {"name": "Plank Hold", "sets": "3", "reps": "60 sec", "weight": "Bodyweight", "tips": "Challenge: lift one foot for last 15 sec"},
        ],
        6: [
            {"name": "Weighted Pull-ups", "sets": "4", "reps": "8", "weight": "BW + 10–15 kg", "tips": "Controlled negative — 3 sec down"},
            {"name": "Barbell Row", "sets": "4", "reps": "10", "weight": "60–75 kg", "tips": "Explosive pull, controlled return"},
            {"name": "Seated Cable Row", "sets": "3", "reps": "12", "weight": "50–60 kg", "tips": "Full stretch at extension, full contraction"},
            {"name": "Barbell Squats", "sets": "5", "reps": "8", "weight": "75–90 kg", "tips": "Peak month — go heavy with perfect form"},
            {"name": "Leg Press", "sets": "4", "reps": "10", "weight": "110–130 kg", "tips": "Full range of motion every single rep"},
            {"name": "Hammer Curls", "sets": "3", "reps": "12", "weight": "14–18 kg each", "tips": "Neutral grip, builds brachialis thickness"},
            {"name": "Plank Hold", "sets": "3", "reps": "75 sec", "weight": "Bodyweight", "tips": "You've come so far — push through!"},
        ],
    }
}

WALK_EXERCISES = [
    {"name": "Outdoor Brisk Walk", "sets": "1", "reps": "30 min", "weight": "Moderate pace", "tips": "Swing arms, heel to toe, keep pace where you can talk but not sing"},
    {"name": "Push-ups", "sets": "3", "reps": "15", "weight": "Bodyweight", "tips": "Chest touches ground, full lockout at top, exhale on the push"},
    {"name": "Walking Lunges", "sets": "3", "reps": "12 each", "weight": "Bodyweight", "tips": "Long stride, keep front knee over ankle, torso upright"},
    {"name": "Stretching / Mobility", "sets": "1", "reps": "15 min", "weight": "Full body", "tips": "Hip flexors, hamstrings, chest, shoulders — hold each 30 sec"},
]

CARDIO_EXERCISES = [
    {"name": "Outdoor Jog / Brisk Walk", "sets": "1", "reps": "40 min", "weight": "Moderate pace", "tips": "Zone 2 cardio — conversational pace, breathing comfortably"},
    {"name": "Crunches", "sets": "3", "reps": "20", "weight": "Bodyweight", "tips": "Exhale each crunch, lower back stays on floor"},
    {"name": "Leg Raises", "sets": "3", "reps": "15", "weight": "Bodyweight", "tips": "Keep legs straight, lower slowly — don't crash them down"},
    {"name": "Bicycle Crunches", "sets": "3", "reps": "20", "weight": "Bodyweight", "tips": "Slow and controlled rotation, don't pull your neck"},
    {"name": "Mountain Climbers", "sets": "3", "reps": "30 sec", "weight": "Bodyweight", "tips": "Fast but controlled, keep hips level — great for BP"},
    {"name": "Cool Down Stretch", "sets": "1", "reps": "15 min", "weight": "", "tips": "Full body — hamstrings, quads, hip flexors, shoulders, chest"},
]
