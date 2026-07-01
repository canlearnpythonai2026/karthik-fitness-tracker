"use client";
import { useEffect, useRef } from "react";
import { SESSION_COLORS } from "@/lib/utils";

const DOWS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

interface Props {
  selected: string;
  onSelect: (date: string) => void;
}

export default function DateStrip({ selected, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return d;
  });

  const getSessionType = (d: Date): string => {
    const dow = d.getDay();
    const map: Record<number, string> = { 0: "rest", 1: "gym", 2: "walk", 3: "cardio", 4: "gym", 5: "walk", 6: "cardio" };
    return map[dow] || "rest";
  };

  useEffect(() => {
    const el = scrollRef.current?.querySelector("[data-today='true']");
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, []);

  return (
    <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
      {dates.map((d) => {
        const dateStr = d.toISOString().split("T")[0];
        const isSelected = dateStr === selected;
        const isToday = dateStr === today.toISOString().split("T")[0];
        const type = getSessionType(d);
        const color = SESSION_COLORS[type];
        return (
          <button key={dateStr} data-today={isToday} onClick={() => onSelect(dateStr)}
            className={`min-w-[48px] flex flex-col items-center py-2 px-1 rounded-2xl border-2 transition-all flex-shrink-0 ${isSelected ? `${color.bg} ${color.border}` : "bg-slate-800 border-transparent"}`}>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider">{DOWS[d.getDay()]}</span>
            <span className={`text-lg font-bold mt-0.5 ${isSelected ? color.text : "text-slate-200"}`}>{d.getDate()}</span>
            <span className={`w-1.5 h-1.5 rounded-full mt-1 ${color.dot}`} />
          </button>
        );
      })}
    </div>
  );
}
