import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/client";
import { useSpeech } from "@/hooks/useSpeech";
import MicButton from "@/components/coach/MicButton";
import { ArrowLeft, Flame, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const PROMPT = "Describe a difficult customer situation you handled, and explain how you resolved it professionally.";

export default function DailyChallenge() {
  const navigate = useNavigate();
  const { listening, supported, startListening, stopListening, transcript } = useSpeech();
  const [user, setUser] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const finish = async () => {
    const text = await stopListening();
    if (!text) return;
    setScoring(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `An English learner answered this speaking challenge: "${PROMPT}". Their answer: "${text}". Give an overall score 0-100 and 2-3 sentences of warm, specific feedback on their grammar, vocabulary and confidence.`,
      response_json_schema: { type: "object", properties: { score: { type: "number" }, feedback: { type: "string" } } },
    });
    const today = format(new Date(), "yyyy-MM-dd");
    await base44.entities.ChallengeResponse.create({ prompt: PROMPT, response_text: text, feedback: res.feedback, score: res.score, challenge_date: today });
    if (user?.last_challenge_date !== today) {
      const newStreak = (user?.streak || 0) + 1;
      await base44.auth.updateMe({ streak: newStreak, last_challenge_date: today });
    }
    setResult(res);
    setScoring(false);
  };

  return (
    <div className="px-5 pt-12 min-h-screen">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 mb-4"><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
      <div className="flex items-center gap-2 text-orange-500 mb-2">
        <Flame className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wider">Daily Challenge</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug mb-6">{PROMPT}</h1>

      {!result ? (
        <>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 min-h-[140px] mb-8">
            <p className="text-xs text-slate-400 mb-2">Your answer</p>
            <p className="text-slate-800 leading-relaxed">{transcript || <span className="text-slate-300">Tap the mic and speak your answer…</span>}</p>
          </div>
          {!supported ? (
            <p className="text-center text-sm text-red-500">Voice input isn't supported here. Try Chrome.</p>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <MicButton listening={listening} disabled={scoring} onClick={() => (listening ? stopListening() : startListening())} />
              {(transcript && !listening) && (
                <button onClick={finish} disabled={scoring} className="flex items-center gap-2 rounded-full px-6 py-3 bg-slate-900 text-white font-medium">
                  {scoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {scoring ? "Scoring…" : "Submit answer"}
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-3xl p-6 bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-center mb-4">
            <p className="text-indigo-100 text-sm">Your score</p>
            <p className="text-5xl font-bold mt-1">{Math.round(result.score)}</p>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-indigo-100"><Flame className="w-4 h-4" /> {(user?.streak || 0)} day streak</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Feedback</p>
            <p className="text-slate-700 leading-relaxed">{result.feedback}</p>
          </div>
          <button onClick={() => navigate("/")} className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 bg-slate-900 text-white font-medium">
            <RotateCcw className="w-4 h-4" /> Back to home
          </button>
        </motion.div>
      )}
    </div>
  );
}