import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/client";
import { Flame, Zap, ChevronRight, BookOpen, Mic, Sparkles, Crown, PenLine } from "lucide-react";
import { SCENARIOS } from "@/lib/coachConfig";
import { motion } from "framer-motion";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [phrase, setPhrase] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (!u.onboarded) { window.location.href = "/onboarding"; return; }
      setUser(u);
    });
    base44.entities.VocabularyPhrase.list("-created_date", 1).then((p) => setPhrase(p[0] || null));
  }, []);

  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div className="px-5 pt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-400">{greeting()},</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{firstName} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/pricing")} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-semibold">Upgrade</span>
          </button>
          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-semibold">{user?.streak || 0}</span>
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate("/daily")}
        className="w-full text-left rounded-3xl p-5 mb-4 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200"
      >
        <div className="flex items-center gap-2 text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-2">
          <Zap className="w-4 h-4" /> Today's Challenge
        </div>
        <p className="text-lg font-semibold leading-snug">Explain a difficult customer situation you handled.</p>
        <div className="flex items-center gap-1 mt-3 text-sm text-indigo-100">Start speaking <ChevronRight className="w-4 h-4" /></div>
      </motion.button>

      <button onClick={() => navigate("/vocabulary")} className="w-full text-left rounded-2xl p-4 mb-6 bg-white border border-slate-100">
        <div className="flex items-center gap-2 text-violet-600 text-xs font-semibold uppercase tracking-wider mb-1.5">
          <BookOpen className="w-4 h-4" /> Phrase of the day
        </div>
        {phrase ? (
          <>
            <p className="font-semibold text-slate-900">"{phrase.phrase}"</p>
            <p className="text-sm text-slate-500 mt-0.5">{phrase.meaning}</p>
          </>
        ) : (
          <p className="text-sm text-slate-400">Open your vocabulary builder to learn today's phrase.</p>
        )}
      </button>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-900">Practice a scenario</h2>
        <button onClick={() => navigate("/practice")} className="text-sm text-indigo-600 font-medium">See all</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {SCENARIOS.slice(0, 4).map((s) => (
          <motion.button
            key={s.key}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/conversation?scenario=${s.key}`)}
            className="rounded-2xl p-4 bg-white border border-slate-100 text-left"
          >
            <span className="text-2xl">{s.emoji}</span>
            <p className="font-semibold text-slate-800 mt-2 text-sm">{s.label}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-tight">{s.desc}</p>
          </motion.button>
        ))}
      </div>

      <button onClick={() => navigate("/practice")} className="w-full mt-4 flex items-center justify-center gap-2 rounded-2xl py-4 bg-slate-900 text-white font-medium">
        <Mic className="w-4 h-4" /> Start a conversation
      </button>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate("/grammar")}
        className="w-full text-left rounded-2xl p-4 mt-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
      >
        <div className="flex items-center gap-2 text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1.5">
          <PenLine className="w-4 h-4" /> Grammar Practice
        </div>
        <p className="font-semibold">Master grammar through speaking</p>
        <p className="text-sm text-emerald-100 mt-0.5">Fill-in-the-blanks, corrections & AI explanations</p>
      </motion.button>
    </div>
  );
}