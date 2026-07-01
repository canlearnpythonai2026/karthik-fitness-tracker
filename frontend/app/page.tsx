"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboard, getToday } from "@/lib/api";
import { SESSION_ICONS } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const [dash, setDash] = useState<Record<string, unknown> | null>(null);
  const [today, setToday] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    getDashboard().then(setDash).catch(() => {});
    getToday().then(setToday).catch(() => {});
  }, []);

  const lost = dash ? Number(dash.kg_lost || 0) : 0;
  const pct = dash ? Number(dash.progress_pct || 0) : 0;
  const latestBw = dash ? Number(dash.latest_weight || 89) : 89;
  const todayType = (today?.session_type as string) || "rest";
  const todayName = (today?.session_name as string) || "";

  return (
    <div className="px-4 pt-6">
      {/* Logo + Name */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-blue-950 border-4 border-blue-500 flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-4xl">🏋️</div>
        </div>
        <h1 className="text-3xl font-black text-slate-100 tracking-tight">Karthik&apos;s</h1>
        <p className="text-3xl font-black tracking-tight"><span className="text-blue-400">Fitness</span> App</p>
        <p className="text-slate-400 text-sm mt-2">89 kg → 78 kg · 6 months · Built for you</p>
      </div>

      {/* Profile card */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-blue-950 border-2 border-blue-500 flex items-center justify-center text-xl font-black text-blue-400">K</div>
        <div className="flex-1">
          <p className="font-bold text-slate-100">Karthik</p>
          <p className="text-xs text-slate-400">Age 42 · Chennai · Samsung Electronics</p>
        </div>
        <span className="text-xs bg-blue-950 text-blue-300 px-3 py-1 rounded-full font-semibold">
          Month {Math.ceil(((Date.now() - new Date("2025-07-07").getTime()) / 86400000) / 28) || 1}
        </span>
      </div>

      {/* BP Warning */}
      <div className="bg-red-950/60 border border-red-900 rounded-2xl p-3 mb-4 flex gap-2 items-start">
        <span className="text-lg">⚠️</span>
        <div>
          <p className="text-red-400 font-bold text-sm">High BP — always active</p>
          <p className="text-red-300 text-xs mt-0.5">Exhale every rep · Stop if chest pain or dizziness · No max-effort lifts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { val: "89", label: "Start kg", color: "text-slate-300" },
          { val: "78", label: "Target kg", color: "text-green-400" },
          { val: String(lost.toFixed(1)), label: "Lost kg", color: "text-blue-400" },
          { val: "6", label: "Months", color: "text-purple-400" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 rounded-2xl p-3 text-center border border-slate-700">
            <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 mb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>89 kg</span>
          <span className="text-blue-400 font-bold">{pct.toFixed(1)}% complete</span>
          <span>78 kg</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">Current: <span className="text-slate-200 font-bold">{latestBw} kg</span></p>
      </div>

      {/* Weekly plan */}
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">This week&apos;s plan</p>
      <div className="space-y-2 mb-6">
        {[
          { day: "Monday + Thursday", type: "gym",    desc: "Gym — weights · 1.5 hrs morning" },
          { day: "Tuesday + Friday",  type: "walk",   desc: "Walk + bodyweight · 45 min" },
          { day: "Wed + Saturday",    type: "cardio", desc: "Cardio + core · 1.5 hrs morning" },
          { day: "Sunday",            type: "rest",   desc: "Rest — light walk only" },
        ].map((p) => (
          <div key={p.day} className="bg-slate-800 rounded-2xl border border-slate-700 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">
              {SESSION_ICONS[p.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-200 text-sm">{p.day}</p>
              <p className="text-xs text-slate-400">{p.desc}</p>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
              p.type === "gym" ? "bg-blue-950 text-blue-400" :
              p.type === "walk" ? "bg-green-950 text-green-400" :
              p.type === "cardio" ? "bg-cyan-950 text-cyan-400" :
              "bg-slate-700 text-slate-400"
            }`}>
              {p.type === "rest" ? "1×" : p.type === "gym" || p.type === "walk" || p.type === "cardio" ? "2×" : ""}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button onClick={() => router.push("/today")}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-2xl text-white font-bold text-lg transition-all mb-2">
        {SESSION_ICONS[todayType]} Start today&apos;s {todayName || "workout"} →
      </button>
      <p className="text-xs text-slate-500 text-center mb-6">
        {today ? `Today: ${today.day_name} · ${today.session_label}` : "Loading..."}
      </p>
    </div>
  );
}
