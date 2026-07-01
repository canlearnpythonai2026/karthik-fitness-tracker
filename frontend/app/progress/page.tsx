"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getDashboard, saveMonthlyCheckin } from "@/lib/api";
import { statusColor, statusIcon } from "@/lib/utils";

interface Dashboard {
  start_weight: number; target_weight: number; latest_weight: number | null;
  kg_lost: number; progress_pct: number; workouts_completed: number;
  monthly_checkins: Array<{ month_number: number; body_weight: number }>;
  month_targets: Record<string, { weight: number; phase: string; gym_style: string }>;
}

const MONTHS = [
  { m: 1, wt: 87, phase: "Foundation", style: "Full Body A/B · 3×12" },
  { m: 2, wt: 85, phase: "Foundation", style: "Full Body A/B · Increase load" },
  { m: 3, wt: 83, phase: "Fat Loss + Strength", style: "Upper/Lower · 4×10" },
  { m: 4, wt: 81, phase: "Fat Loss + Strength", style: "Heavier weights" },
  { m: 5, wt: 79, phase: "Lean Muscle", style: "Push/Pull-Legs · 4×10" },
  { m: 6, wt: 78, phase: "Lean Muscle", style: "Progressive overload" },
];

export default function ProgressPage() {
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    getDashboard().then(d => {
      setDash(d);
      const init: Record<number, string> = {};
      d.monthly_checkins.forEach((c: { month_number: number; body_weight: number }) => { init[c.month_number] = c.body_weight.toString(); });
      setInputs(init);
    }).catch(() => toast.error("Could not load progress"));
  }, []);

  async function handleCheckin(month: number) {
    const val = parseFloat(inputs[month] || "");
    if (isNaN(val) || val < 50 || val > 150) { toast.error("Enter a valid weight"); return; }
    setSaving(month);
    try {
      await saveMonthlyCheckin({ month_number: month, body_weight: val });
      toast.success(`Month ${month} checked in! 💪`);
      getDashboard().then(setDash);
    } catch { toast.error("Save failed"); } finally { setSaving(null); }
  }

  const checkinMap: Record<number, number> = {};
  (dash?.monthly_checkins || []).forEach(c => { checkinMap[c.month_number] = c.body_weight; });
  const pct = dash?.progress_pct || 0;

  return (
    <div className="px-4 pt-5">
      <h1 className="text-2xl font-black text-slate-100 mb-1">Progress</h1>
      <p className="text-slate-400 text-sm mb-5">Your journey to 78 kg</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "Current weight", val: dash?.latest_weight ? `${dash.latest_weight}` : "—", unit: "kg", color: "text-slate-100" },
          { label: "Lost so far", val: dash ? dash.kg_lost.toFixed(1) : "—", unit: "kg", color: "text-green-400" },
          { label: "Workouts done", val: dash?.workouts_completed?.toString() || "0", unit: "sessions", color: "text-blue-400" },
          { label: "Goal", val: "78", unit: "kg target", color: "text-purple-400" },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.unit}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 mb-5">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>89 kg start</span>
          <span className="text-blue-400 font-bold">{pct.toFixed(1)}%</span>
          <span>78 kg goal</span>
        </div>
        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
            style={{ width: `${Math.max(pct, 2)}%` }}>
            {pct > 10 && <span className="text-[9px] text-white font-bold">{pct.toFixed(0)}%</span>}
          </div>
        </div>
      </div>

      {/* Monthly targets */}
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Monthly check-in</p>
      <div className="space-y-3">
        {MONTHS.map(({ m, wt, phase, style }) => {
          const actual = checkinMap[m] || null;
          const icon = statusIcon(actual, wt);
          const color = statusColor(actual, wt);
          return (
            <div key={m} className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <span className="font-bold text-slate-100">Month {m}</span>
                  <span className="text-blue-400 font-bold ml-3">Target: {wt} kg</span>
                </div>
                <span className="text-lg">{icon}</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{phase} · {style}</p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold flex-1 ${color}`}>
                  {actual ? `${actual} kg logged` : "Not logged yet"}
                </span>
                <input type="number" step="0.1" placeholder="kg" value={inputs[m] || ""}
                  onChange={e => setInputs(prev => ({ ...prev, [m]: e.target.value }))}
                  className="w-20 bg-slate-700 border border-slate-600 focus:border-blue-500 rounded-xl text-slate-100 text-base font-bold text-center py-2 focus:outline-none" />
                <button onClick={() => handleCheckin(m)} disabled={saving === m}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-white text-xs font-bold transition-colors">
                  {saving === m ? "..." : "Save"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
