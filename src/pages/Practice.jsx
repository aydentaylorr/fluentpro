import React from "react";
import { useNavigate } from "react-router-dom";
import { SCENARIOS } from "@/lib/coachConfig";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Practice() {
  const navigate = useNavigate();
  return (
    <div className="px-5 pt-12">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Choose a scenario</h1>
      <p className="text-slate-500 mt-1 mb-6">The AI will start the conversation. Just speak naturally.</p>
      <div className="space-y-3">
        {SCENARIOS.map((s, i) => (
          <motion.button
            key={s.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/conversation?scenario=${s.key}`)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl shrink-0">{s.emoji}</div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">{s.label}</p>
              <p className="text-sm text-slate-400">{s.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}