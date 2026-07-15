import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/client";
import { GOALS, LEVELS, INDUSTRIES, ACCENTS } from "@/lib/coachConfig";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { title: "What's your goal?", subtitle: "We'll personalise everything for you", key: "goal", options: GOALS },
  { title: "Your English level", subtitle: "Be honest — this helps us adapt", key: "english_level", options: LEVELS },
  { title: "Your industry", subtitle: "We'll teach relevant vocabulary", key: "industry", options: INDUSTRIES },
  { title: "Preferred accent", subtitle: "Pick the accent you want to sound like", key: "accent", options: ACCENTS },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ accent: "american" });
  const [saving, setSaving] = useState(false);
  const current = STEPS[step];

  const select = async (val) => {
    const next = { ...data, [current.key]: val };
    setData(next);
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(step + 1), 220);
    } else {
      setSaving(true);
      await base44.auth.updateMe({ ...next, onboarded: true });
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col px-6 py-10">
      <div className="flex items-center gap-1.5 mb-8">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full flex-1 transition-colors ${i <= step ? "bg-indigo-600" : "bg-slate-100"}`} />
        ))}
      </div>
      <div className="flex items-center gap-2 text-indigo-600 mb-2">
        <Sparkles className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Personalise</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{current.title}</h1>
          <p className="text-slate-500 mt-1 mb-8">{current.subtitle}</p>
          <div className="space-y-3">
            {current.options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => select(opt.key)}
                disabled={saving}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                  data[current.key] === opt.key ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{opt.emoji || opt.flag || "•"}</span>
                  <span className="font-medium text-slate-800">
                    {opt.label}
                    {opt.desc && <span className="block text-xs text-slate-400 font-normal">{opt.desc}</span>}
                  </span>
                </span>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}