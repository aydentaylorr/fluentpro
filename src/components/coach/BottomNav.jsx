import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Mic, BookOpen, BarChart3, PenLine } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/practice", label: "Practice", icon: Mic },
  { to: "/grammar", label: "Grammar", icon: PenLine },
  { to: "/vocabulary", label: "Vocab", icon: BookOpen },
  { to: "/progress", label: "Progress", icon: BarChart3 },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-100 bg-white/90 backdrop-blur-xl">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link key={to} to={to} className="flex flex-col items-center gap-1 py-2.5">
              <Icon className={`w-5 h-5 transition-colors ${active ? "text-indigo-600" : "text-slate-400"}`} strokeWidth={active ? 2.4 : 2} />
              <span className={`text-[11px] font-medium transition-colors ${active ? "text-indigo-600" : "text-slate-400"}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}