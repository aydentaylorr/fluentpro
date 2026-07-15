import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/client";
import ScoreRing from "@/components/coach/ScoreRing";
import { useSpeech } from "@/hooks/useSpeech";
import { CheckCircle2, XCircle, Volume2, RotateCcw, Home, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const AREAS = [
  { key: "grammar_score", label: "Grammar", color: "#4f46e5" },
  { key: "pronunciation_score", label: "Pronunciation", color: "#0891b2" },
  { key: "fluency_score", label: "Fluency", color: "#7c3aed" },
  { key: "vocabulary_score", label: "Vocabulary", color: "#db2777" },
  { key: "confidence_score", label: "Confidence", color: "#ea580c" },
];

export default function Feedback() {
  const navigate = useNavigate();
  const { speak } = useSpeech();
  const id = new URLSearchParams(window.location.search).get("id");
  const [session, setSession] = useState(null);
  const [extra, setExtra] = useState(null);

  useEffect(() => {
    base44.entities.PracticeSession.get(id).then(setSession);
    const raw = sessionStorage.getItem(`feedback_${id}`);
    if (raw) setExtra(JSON.parse(raw));
  }, [id]);

  if (!session) return <div className="flex justify-center pt-40"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>;

  const overall = Math.round(AREAS.reduce((a, x) => a + (session[x.key] || 0), 0) / AREAS.length);
  const noAnswers = !session.grammar_score && !session.pronunciation_score;

  return (
    <div className="px-5 pt-12">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-6">
        <p className="text-sm text-slate-400">{session.scenario_label} · Session complete</p>
        <div className="mt-3 flex justify-center"><ScoreRing value={overall} size={96} color="#4f46e5" /></div>
        <p className="mt-2 font-semibold text-slate-900">Overall score</p>
        {extra?.summary && <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">{extra.summary}</p>}
      </motion.div>

      {noAnswers ? (
        <p className="text-center text-slate-500 bg-white rounded-2xl p-6 border border-slate-100">No spoken answers were recorded. Try the scenario again and speak your replies.</p>
      ) : (
        <>
          <div className="grid grid-cols-5 gap-1 bg-white rounded-2xl p-4 border border-slate-100 mb-4">
            {AREAS.map((a) => (
              <ScoreRing key={a.key} value={session[a.key] || 0} size={52} label={a.label} color={a.color} />
            ))}
          </div>

          {extra?.corrected_sentence && (
            <div className="bg-white rounded-2xl p-5 border border-slate-100 mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Suggested improvement</p>
              <div className="flex items-start gap-2 mb-3">
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-slate-500 line-through">{extra.original_sentence}</p>
              </div>
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <p className="text-slate-900 font-medium flex-1">{extra.corrected_sentence}</p>
                <button onClick={() => speak(extra.corrected_sentence)} className="text-indigo-500"><Volume2 className="w-5 h-5" /></button>
              </div>
              {extra.correction_reason && <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-3 mt-2">💡 {extra.correction_reason}</p>}
            </div>
          )}
        </>
      )}

      <div className="flex gap-3 mt-2">
        <button onClick={() => navigate(`/conversation?scenario=${session.scenario}`)} className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 bg-slate-900 text-white font-medium">
          <RotateCcw className="w-4 h-4" /> Practice again
        </button>
        <button onClick={() => navigate("/")} className="flex items-center justify-center rounded-2xl py-3.5 px-4 bg-white border border-slate-200 text-slate-700">
          <Home className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}