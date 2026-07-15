import React, { useState } from "react";
import { base44 } from "@/api/client";
import { useSpeech } from "@/hooks/useSpeech";
import MicButton from "@/components/coach/MicButton";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Volume2, RotateCcw, PenLine, Mic, Type } from "lucide-react";

const TOPICS = [
  { key: "present_perfect", label: "Present Perfect", emoji: "⏳" },
  { key: "conditionals", label: "Conditionals", emoji: "🔀" },
  { key: "passive_voice", label: "Passive Voice", emoji: "🔄" },
  { key: "articles", label: "Articles", emoji: "📄" },
  { key: "prepositions", label: "Prepositions", emoji: "📍" },
  { key: "modal_verbs", label: "Modal Verbs", emoji: "✨" },
  { key: "reported_speech", label: "Reported Speech", emoji: "💬" },
  { key: "question_formation", label: "Question Formation", emoji: "❓" },
  { key: "business_grammar", label: "Business Grammar", emoji: "💼" },
  { key: "email_grammar", label: "Email Grammar", emoji: "📧" },
];

export default function Grammar() {
  const { listening, transcript, supported, startListening, stopListening, speak } = useSpeech();
  const [topic, setTopic] = useState(null);
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [mode, setMode] = useState("voice"); // "voice" | "text"

  const generateExercise = async (topicKey) => {
    setLoading(true);
    setExercise(null);
    setAnswer("");
    setResult(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a fill-in-the-blank Business English grammar exercise about ${TOPICS.find(t => t.key === topicKey)?.label}. 
Return a sentence with "____" where the blank is (a single word or short phrase is missing), the correct answer, and a short, clear explanation of the grammar rule. Make it suitable for B1-B2 level learners.`,
      response_json_schema: {
        type: "object",
        properties: {
          sentence: { type: "string" },
          answer: { type: "string" },
          explanation: { type: "string" },
        },
      },
    });
    setExercise(res);
    setLoading(false);
  };

  const selectTopic = (t) => {
    setTopic(t);
    generateExercise(t.key);
  };

  const submitVoice = async () => {
    const text = await stopListening();
    if (!text) return;
    checkAnswer(text);
  };

  const checkAnswer = async (userAnswer) => {
    setChecking(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `A learner is doing a fill-in-the-blank grammar exercise.
Sentence with blank: "${exercise.sentence}"
Correct answer: "${exercise.answer}"
Learner's answer: "${userAnswer}"

Is the learner's answer correct (accepting minor spelling/capitalization differences)? Respond with is_correct (boolean) and brief, encouraging feedback (1-2 sentences).`,
      response_json_schema: {
        type: "object",
        properties: {
          is_correct: { type: "boolean" },
          feedback: { type: "string" },
        },
      },
    });
    setResult({ ...res, userAnswer });
    setChecking(false);
  };

  if (!topic) {
    return (
      <div className="px-5 pt-12">
        <div className="flex items-center gap-2 mb-1">
          <PenLine className="w-5 h-5 text-emerald-600" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Grammar Practice</h1>
        </div>
        <p className="text-slate-500 mt-1 mb-5">Learn grammar through speaking and interactive exercises.</p>
        <div className="grid grid-cols-2 gap-3">
          {TOPICS.map((t, i) => (
            <motion.button
              key={t.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => selectTopic(t)}
              className="rounded-2xl p-4 bg-white border border-slate-100 text-left"
            >
              <span className="text-2xl">{t.emoji}</span>
              <p className="font-semibold text-slate-800 mt-2 text-sm">{t.label}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-12">
      <button onClick={() => { setTopic(null); setExercise(null); setResult(null); }} className="flex items-center gap-1 text-sm text-slate-500 mb-4">
        <ArrowLeft className="w-4 h-4" /> All topics
      </button>

      <div className="flex items-center gap-2 mb-5">
        <span className="text-2xl">{TOPICS.find(t => t.key === topic)?.emoji}</span>
        <h1 className="text-xl font-bold text-slate-900">{TOPICS.find(t => t.key === topic)?.label}</h1>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-sm text-slate-400">Creating your exercise…</p>
          </motion.div>
        ) : result ? (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`rounded-2xl p-5 mb-4 ${result.is_correct ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.is_correct ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-400" />}
                <span className="font-semibold text-slate-900">{result.is_correct ? "Correct!" : "Not quite"}</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">{result.feedback}</p>
              {!result.is_correct && (
                <div className="bg-white rounded-xl p-3 border border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">Correct answer:</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 flex-1">{exercise.answer}</p>
                    <button onClick={() => speak(exercise.answer)} className="text-indigo-500"><Volume2 className="w-5 h-5" /></button>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Grammar rule</p>
              <p className="text-sm text-slate-600">{exercise.explanation}</p>
            </div>
            <button onClick={() => generateExercise(topic)} className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 bg-slate-900 text-white font-medium">
              <RotateCcw className="w-4 h-4" /> Next exercise
            </button>
          </motion.div>
        ) : exercise ? (
          <motion.div key="exercise" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Fill in the blank</p>
              <p className="text-lg text-slate-900 leading-relaxed">
                {exercise.sentence.split("____").map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="inline-block mx-1 px-3 py-0.5 border-b-2 border-indigo-400 text-indigo-400">______</span>}
                  </React.Fragment>
                ))}
              </p>
            </div>

            {mode === "voice" ? (
              <div className="flex flex-col items-center gap-4">
                {!supported ? (
                  <p className="text-center text-sm text-red-500 mb-2">Voice input isn't supported here. Switch to text mode.</p>
                ) : (
                  <>
                    <div className="min-h-[48px] text-center text-slate-600 text-sm w-full">
                      {listening ? (transcript || "Listening…") : "Tap the mic and say your answer"}
                    </div>
                    <MicButton listening={listening} disabled={checking} onClick={() => (listening ? submitVoice() : startListening())} />
                    {transcript && !listening && (
                      <button onClick={() => checkAnswer(transcript)} disabled={checking} className="flex items-center gap-2 rounded-full px-6 py-3 bg-slate-900 text-white font-medium disabled:opacity-50">
                        {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        {checking ? "Checking…" : "Check answer"}
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => setMode("text")} className="flex items-center gap-1 text-sm text-slate-400 mt-2">
                  <Type className="w-4 h-4" /> Type instead
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer…"
                  className="w-full rounded-2xl px-4 py-3 border border-slate-200 focus:border-indigo-400 focus:outline-none text-slate-900"
                />
                <button onClick={() => checkAnswer(answer)} disabled={!answer.trim() || checking} className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 bg-slate-900 text-white font-medium disabled:opacity-50">
                  {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {checking ? "Checking…" : "Check answer"}
                </button>
                <button onClick={() => setMode("voice")} className="flex items-center justify-center gap-1 text-sm text-slate-400">
                  <Mic className="w-4 h-4" /> Speak instead
                </button>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}