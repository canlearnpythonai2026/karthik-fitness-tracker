"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getDashboard, saveWeeklyWeight } from "@/lib/api";
import { statusIcon, statusColor } from "@/lib/utils";

const TARGETS = [89,88.5,88,87.5,87,86.5,86.5,86,85.5,85,85,84.5,84,83.5,83,82.5,82,81.5,81,80.5,79.5,79,78.5,78];
const START = new Date("2025-07-07");

function getSundayDate(week: number): string {
  const d = new Date(START.getTime() + (week - 1) * 7 * 86400000 + 6 * 86400000);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function WeightPage() {
  const [weeklyMap, setWeeklyMap] = useState<Record<number, number>>({});
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    getDashboard().then(d => {
      const map: Record<number, number> = {};
      (d.weekly_weights || []).forEach((w: { week_number: number; body_weight: number }) => { map[w.week_number] = w.body_weight; });
      setWeeklyMap(map);
      const init: Record<number, string> = {};
      Object.entries(map).forEach(([k, v]) => { init[Number(k)] = v.toString(); });
      setInputs(init);
    }).catch(() => {});
  }, []);

  async function handleSave(week: number) {
    const val = parseFloat(inputs[week] || "");
    if (isNaN(val) || val < 50 || val > 150) { toast.error("Enter a valid weight"); return; }
    setSaving(week);
    try {
      await saveWeeklyWeight({ week_number: week, body_weight: val, weigh_date: getSundayDate(week) });
      setWeeklyMap(prev => ({ ...prev, [week]: val }));
      toast.success(`Week ${week} logged! ✅`);
    } catch { toast.error("Save failed"); } finally { setSaving(null); }
  }

  return (
    <div className="px-4 pt-5">
      <h1 className="text-2xl font-black text-slate-100 mb-1">Weight log</h1>
      <p className="text-slate-400 text-sm mb-3">Weigh every Sunday morning before eating</p>

      <div className="bg-red-950/60 border border-red-900 rounded-2xl p-3 mb-5 flex gap-2 items-start">
        <span className="text-base">⚠️</span>
        <div>
          <p className="text-red-400 font-bold text-xs">High BP reminder</p>
          <p className="text-red-300 text-xs mt-0.5">Exhale every rep · Stop if dizziness · Check BP every 2 weeks</p>
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 24 }, (_, i) => i + 1).map(week => {
          const tgt = TARGETS[week - 1];
          const actual = weeklyMap[week] || null;
          const month = Math.ceil(week / 4);
          return (
            <div key={week} className="bg-slate-800 rounded-2xl border border-slate-700 p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-200 text-sm">Week {week}</span>
                  <span className="text-xs text-slate-500">Month {month}</span>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{getSundayDate(week)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-blue-400 font-semibold">Target: {tgt} kg</span>
                  {actual && <span className={`text-xs font-bold ${statusColor(actual, tgt)}`}>{actual} kg {statusIcon(actual, tgt)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <input type="number" step="0.1" placeholder="kg" value={inputs[week] || ""}
                  onChange={e => setInputs(prev => ({ ...prev, [week]: e.target.value }))}
                  className="w-16 bg-slate-700 border border-slate-600 focus:border-blue-500 rounded-xl text-slate-100 text-sm font-bold text-center py-2 focus:outline-none" />
                <button onClick={() => handleSave(week)} disabled={saving === week}
                  className="w-12 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-white text-xs font-bold transition-colors">
                  {saving === week ? "..." : actual ? "✓" : "Log"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
