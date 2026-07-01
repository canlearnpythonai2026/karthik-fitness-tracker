"use client";
import { usePathname, useRouter } from "next/navigation";
import { Home, BarChart2, Weight, Dumbbell } from "lucide-react";

const NAV = [
  { href: "/", icon: Home,      label: "Home"     },
  { href: "/today",   icon: Dumbbell,  label: "Today"    },
  { href: "/progress",icon: BarChart2, label: "Progress" },
  { href: "/weight",  icon: Weight,    label: "Weight"   },
];

export default function BottomNav() {
  const path = usePathname();
  const router = useRouter();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 flex z-50 safe-bottom">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = path === href;
        return (
          <button key={href} onClick={() => router.push(href)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${active ? "text-blue-400" : "text-slate-500 hover:text-slate-300"}`}>
            <Icon size={22} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
