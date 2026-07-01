"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Dumbbell, Info } from "lucide-react";
import { getExerciseGif } from "@/lib/api";

interface Exercise {
  index: number;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  tips: string;
  gif_id?: string;
}

interface Log {
  actual_sets?: number;
  actual_reps?: number;
  actual_weight?: number;
  rpe?: number;
  done?: boolean;
}

interface Props {
  exercise: Exercise;
  log: Log;
  date: string;
  sessionType: string;
  onUpdate: (index: number, field: string, value: unknown) => void;
  onToggleDone: (index: number) => void;
}

export default function ExerciseCard({ exercise, log, sessionType, onUpdate, onToggleDone }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [gifData, setGifData] = useState<{ gif_url: string; instructions: string[]; target: string[]; equipment: string[] } | null>(null);
  const [gifLoading, setGifLoading] = useState(false);
  const isGym = sessionType === "gym";

  async function loadGif() {
    if (gifData) { setExpanded(!expanded); return; }
    setExpanded(true);
    setGifLoading(true);
    try {
      const data = await getExerciseGif(exercise.name);
      setGifData(data);
    } catch {
      setGifData(null);
    } finally {
      setGifLoading(false);
    }
  }

  const isDone = log.done || false;

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${isDone ? "border-green-800 bg-green-950/30" : "border-slate-700 bg-slate-800/60"}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDone ? "bg-green-600" : "bg-slate-700"}`}>
            {isDone ? <span className="text-sm">✓</span> : <Dumbbell size={16} className="text-slate-300" />}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-100 text-[15px] leading-tight">{exercise.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {exercise.sets} sets · {exercise.reps} · {exercise.weight}
            </p>
          </div>
        </div>
        <button onClick={loadGif} className="flex items-center gap-1 text-blue-400 text-xs font-medium px-2 py-1 rounded-lg bg-blue-950/50 hover:bg-blue-900/50 transition-colors">
          <Info size={12} />
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Expanded: GIF + Steps */}
      {expanded && (
        <div className="border-t border-slate-700">
          <div className="bg-slate-900 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Correct form</span>
              {gifData?.target && gifData.target.length > 0 && (
                <span className="text-xs bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full">
                  {gifData.target.slice(0, 2).join(", ")}
                </span>
              )}
            </div>

            {gifLoading && (
              <div className="w-full h-48 bg-slate-800 rounded-xl flex items-center justify-center">
                <div className="text-slate-400 text-sm animate-pulse">Loading exercise GIF...</div>
              </div>
            )}

            {gifData?.gif_url && !gifLoading && (
              <div className="relative w-full h-52 bg-slate-800 rounded-xl overflow-hidden">
                <Image src={gifData.gif_url} alt={exercise.name} fill className="object-contain" unoptimized />
              </div>
            )}

            {!gifLoading && !gifData?.gif_url && (
              <div className="w-full h-32 bg-slate-800 rounded-xl flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">🏋️</span>
                <p className="text-slate-400 text-xs text-center px-4">{exercise.tips}</p>
              </div>
            )}

            {/* BP tip */}
            <div className="mt-2 bg-red-950/50 border border-red-900/50 rounded-lg px-3 py-2">
              <p className="text-xs text-red-300">
                <span className="font-bold">⚠️ BP tip:</span> Exhale on every rep. Never hold your breath.
              </p>
            </div>
          </div>

          {/* Step by step */}
          {gifData?.instructions && gifData.instructions.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-700">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">How to do it</p>
              <ol className="space-y-2">
                {gifData.instructions.slice(0, 5).map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Quick tips */}
          <div className="grid grid-cols-3 gap-2 px-4 pb-3 border-t border-slate-700 pt-3">
            {[
              { icon: "🫁", label: "Breathe", val: "Exhale up" },
              { icon: "💪", label: "Focus", val: gifData?.target?.[0] || "Full body" },
              { icon: "🏋️", label: "Equipment", val: gifData?.equipment?.[0] || exercise.weight },
            ].map((t) => (
              <div key={t.label} className="bg-slate-700/50 rounded-xl p-2 text-center">
                <div className="text-base">{t.icon}</div>
                <div className="text-[9px] text-slate-400 mt-0.5">{t.label}</div>
                <div className="text-[11px] font-semibold text-slate-200 mt-0.5 leading-tight">{t.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inputs */}
      {isGym ? (
        <div className="px-4 pb-4 pt-2 border-t border-slate-700/50">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Sets done", field: "actual_sets", placeholder: exercise.sets, type: "number" },
              { label: "Reps done", field: "actual_reps", placeholder: exercise.reps, type: "number" },
              { label: "Weight kg", field: "actual_weight", placeholder: "kg", type: "number" },
            ].map((inp) => (
              <div key={inp.field}>
                <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">{inp.label}</label>
                <input
                  type={inp.type}
                  placeholder={inp.placeholder}
                  value={(log as Record<string, unknown>)[inp.field] as string || ""}
                  onChange={(e) => onUpdate(exercise.index, inp.field, e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl text-slate-100 text-[15px] font-bold text-center py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[10px] text-slate-400">RPE</span>
              <input
                type="range" min="1" max="10" step="1"
                value={log.rpe || 7}
                onChange={(e) => onUpdate(exercise.index, "rpe", Number(e.target.value))}
                className="flex-1 accent-amber-400"
              />
              <span className="text-amber-400 font-bold text-sm w-5">{log.rpe || 7}</span>
            </div>
            <button
              onClick={() => onToggleDone(exercise.index)}
              className={`ml-3 w-9 h-9 rounded-full border-2 flex items-center justify-center text-base transition-all ${isDone ? "bg-green-500 border-green-400 text-white" : "border-slate-500 text-slate-400 hover:border-green-500"}`}
            >
              {isDone ? "✓" : "○"}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-4 pt-2 border-t border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[10px] text-slate-400">Effort</span>
            <input type="range" min="1" max="10" step="1"
              value={log.rpe || 6}
              onChange={(e) => onUpdate(exercise.index, "rpe", Number(e.target.value))}
              className="flex-1 accent-amber-400"
            />
            <span className="text-amber-400 font-bold text-sm w-5">{log.rpe || 6}</span>
          </div>
          <button
            onClick={() => onToggleDone(exercise.index)}
            className={`ml-3 w-9 h-9 rounded-full border-2 flex items-center justify-center text-base transition-all ${isDone ? "bg-green-500 border-green-400 text-white" : "border-slate-500 text-slate-400"}`}
          >
            {isDone ? "✓" : "○"}
          </button>
        </div>
      )}
    </div>
  );
}
