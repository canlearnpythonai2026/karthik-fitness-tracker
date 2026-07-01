"use client";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import DateStrip from "@/components/DateStrip";
import ExerciseCard from "@/components/ExerciseCard";
import { getDay, getWorkoutLog, saveWorkoutLog, saveExerciseLog } from "@/lib/api";
import { SESSION_COLORS, SESSION_ICONS, todayStr } from "@/lib/utils";

interface Exercise { index: number; name: string; sets: string; reps: string; weight: string; tips: string; gif_id?: string; }
interface DayPlan {
  date: string; day_name: string; formatted_date: string;
  session_type: string; session_label: string; session_name: string;
  month: number; week_number: number; month_target_weight: number;
  exercises: Exercise[];
}

export default function TodayPage() {
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [logs, setLogs] = useState<Record<number, Record<string, unknown>>>({});
  const [bodyWeight, setBodyWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadDay = useCallback(async (date: string) => {
    try {
      const [dayData, logData] = await Promise.all([getDay(date), getWorkoutLog(date)]);
      setPlan(dayData);
      if (logData.log) { setBodyWeight(logData.log.body_weight?.toString() || ""); setNotes(logData.log.notes || ""); }
      else { setBodyWeight(""); setNotes(""); }
      const exMap: Record<number, Record<string, unknown>> = {};
      (logData.exercises || []).forEach((ex: Record<string, unknown>) => { exMap[ex.exercise_index as number] = ex; });
      setLogs(exMap);
    } catch { toast.error("Could not load workout"); }
  }, []);

  useEffect(() => { loadDay(selectedDate); }, [selectedDate, loadDay]);

  const handleUpdate = useCallback((index: number, field: string, value: unknown) => {
    setLogs(prev => ({ ...prev, [index]: { ...(prev[index] || {}), [field]: value } }));
  }, []);

  const handleToggleDone = useCallback((index: number) => {
    setLogs(prev => ({ ...prev, [index]: { ...(prev[index] || {}), done: !(prev[index]?.done) } }));
  }, []);

  async function handleSave() {
    if (!plan) return;
    setSaving(true);
    try {
      await saveWorkoutLog({ date: selectedDate, body_weight: bodyWeight ? parseFloat(bodyWeight) : undefined, notes, completed: Object.values(logs).some(l => l.done) });
      await Promise.all(plan.exercises.map((ex) => {
        const log = logs[ex.index] || {};
        return saveExerciseLog({ date: selectedDate, exercise_index: ex.index, exercise_name: ex.name, actual_sets: log.actual_sets || undefined, actual_reps: log.actual_reps || undefined, actual_weight: log.actual_weight || undefined, rpe: log.rpe || undefined, done: log.done || false });
      }));
      toast.success("Saved! 💪");
    } catch { toast.error("Save failed"); } finally { setSaving(false); }
  }

  const colors = SESSION_COLORS[plan?.session_type || "rest"];
  const doneCount = Object.values(logs).filter(l => l.done).length;
  const totalEx = plan?.exercises.length || 0;

  return (
    <div className="px-4 pt-5">
      <div className="mb-4">
        <h1 className="text-2xl font-black text-slate-100">{new Date().getHours() < 12 ? "Good morning" : "Good evening"} 💪</h1>
        <p className="text-slate-400 text-sm mt-0.5">{plan?.formatted_date || "Loading..."}</p>
      </div>
      <DateStrip selected={selectedDate} onSelect={setSelectedDate} />
      {plan && (
        <>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 mt-3 ${colors.bg} ${colors.text} border ${colors.border}`}>
            <span>{SESSION_ICONS[plan.session_type]}</span>
            <span>{plan.session_label} — {plan.session_name}</span>
            {totalEx > 0 && <span className="ml-1 opacity-70">({doneCount}/{totalEx})</span>}
          </div>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Morning weight</p>
              <p className="text-xs text-amber-400 mt-0.5">Target: {plan.month_target_weight} kg this month</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" step="0.1" placeholder="—" value={bodyWeight} onChange={e => setBodyWeight(e.target.value)}
                className="w-20 bg-slate-700 border-2 border-slate-600 focus:border-amber-400 rounded-xl text-amber-400 text-xl font-black text-center py-2 focus:outline-none" />
              <span className="text-slate-400 text-sm">kg</span>
            </div>
          </div>
          {plan.session_type === "rest" ? (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center mb-4">
              <div className="text-6xl mb-4">😴</div>
              <h2 className="text-xl font-bold">Rest & Recover</h2>
              <p className="text-slate-400 text-sm mt-2">Muscles grow during rest. Light 20-min walk is great.</p>
            </div>
          ) : (
            <>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Exercises</p>
              <div className="space-y-3">
                {plan.exercises.map((ex) => (
                  <ExerciseCard key={ex.index} exercise={ex} log={logs[ex.index] || {}} date={selectedDate}
                    sessionType={plan.session_type} onUpdate={handleUpdate} onToggleDone={handleToggleDone} />
                ))}
              </div>
            </>
          )}
          <div className="mt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did it feel? Any pain?"
              className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-2xl text-slate-300 text-sm p-4 resize-none h-20 focus:outline-none" />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full mt-4 mb-4 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 active:scale-95 rounded-2xl text-white font-bold text-base transition-all">
            {saving ? "Saving..." : `Save log ✓ (${doneCount}/${totalEx} done)`}
          </button>
        </>
      )}
    </div>
  );
}
