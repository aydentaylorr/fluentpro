import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/client";
import { SCENARIOS, INDUSTRIES, labelFor } from "@/lib/coachConfig";
import { useSpeech } from "@/hooks/useSpeech";
import MicButton from "@/components/coach/MicButton";
import { ArrowLeft, Volume2, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Conversation() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const scenarioKey = params.get("scenario") || "interview";
  const scenario = SCENARIOS.find((s) => s.key === scenarioKey) || SCENARIOS[0];

  const { listening, speaking, transcript, supported, startListening, stopListening, speak } = useSpeech();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [session, setSession] = useState(null);
  const [thinking, setThinking] = useState(true);
  const [ending, setEnding] = useState(false);
  const startTime = useRef(Date.now());
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const s = await base44.entities.PracticeSession.create({ scenario: scenarioKey, scenario_label: scenario.label, messages: [], status: "active" });
      setSession(s);
      const first = await aiReply([], u);
      const msgs = [{ role: "ai", text: first }];
      setMessages(msgs);
      setThinking(false);
      speak(first, u.accent);
    })();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const aiReply = async (history, u) => {
    const industry = u?.industry ? labelFor(INDUSTRIES, u.industry) : "general business";
    const convo = history.map((m) => `${m.role === "ai" ? "Coach" : "Learner"}: ${m.text}`).join("\n");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are role-playing as ${scenario.persona} in a "${scenario.label}" scenario, helping a ${u?.english_level || "B1"} level English learner who works in ${industry} practise Business English.
Stay fully in character. Keep replies short (1-3 sentences), natural and conversational, and always end with a question or prompt so the learner keeps speaking. Do NOT correct their English here — just converse.
${convo ? "Conversation so far:\n" + convo : "Start the conversation with a warm, natural opening line."}`,
    });
    return typeof res === "string" ? res.trim() : String(res);
  };

  const handleMic = async () => {
    if (listening) {
      stopListening();
      const text = transcript.trim();
      if (!text) return;
      const withUser = [...messages, { role: "user", text }];
      setMessages(withUser);
      setThinking(true);
      const reply = await aiReply(withUser, user);
      const withAi = [...withUser, { role: "ai", text: reply }];
      setMessages(withAi);
      setThinking(false);
      base44.entities.PracticeSession.update(session.id, { messages: withAi });
      speak(reply, user.accent);
    } else {
      startListening();
    }
  };

  const endSession = async () => {
    setEnding(true);
    const userTurns = messages.filter((m) => m.role === "user");
    const duration = Math.max(1, Math.round((Date.now() - startTime.current) / 60000));
    if (userTurns.length === 0) {
      await base44.entities.PracticeSession.update(session.id, { status: "completed", duration_minutes: duration });
      navigate(`/feedback?id=${session.id}`);
      return;
    }
    const convo = messages.map((m) => `${m.role === "ai" ? "Coach" : "Learner"}: ${m.text}`).join("\n");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Evaluate this English learner's spoken performance in a "${scenario.label}" role-play. Score 0-100 for each area based only on the Learner turns. Also give one short encouraging summary and one corrected example (their sentence -> a better version with a brief why).
Conversation:\n${convo}`,
      response_json_schema: {
        type: "object",
        properties: {
          grammar_score: { type: "number" },
          pronunciation_score: { type: "number" },
          fluency_score: { type: "number" },
          vocabulary_score: { type: "number" },
          confidence_score: { type: "number" },
          summary: { type: "string" },
          original_sentence: { type: "string" },
          corrected_sentence: { type: "string" },
          correction_reason: { type: "string" },
        },
      },
    });
    await base44.entities.PracticeSession.update(session.id, {
      status: "completed",
      duration_minutes: duration,
      grammar_score: res.grammar_score,
      pronunciation_score: res.pronunciation_score,
      fluency_score: res.fluency_score,
      vocabulary_score: res.vocabulary_score,
      confidence_score: res.confidence_score,
      messages,
    });
    sessionStorage.setItem(`feedback_${session.id}`, JSON.stringify(res));
    navigate(`/feedback?id=${session.id}`);
  };

  return (
    <div className="fixed inset-0 max-w-md mx-auto bg-slate-50 flex flex-col">
      <div className="flex items-center justify-between px-5 pt-12 pb-4 bg-white border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
        <div className="text-center">
          <p className="text-xs text-slate-400">{scenario.emoji} Role-play</p>
          <p className="font-semibold text-slate-800 text-sm">{scenario.label}</p>
        </div>
        <button onClick={endSession} disabled={ending} className="flex items-center gap-1 text-sm font-medium text-indigo-600 disabled:opacity-50">
          <Flag className="w-4 h-4" /> End
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed ${m.role === "user" ? "bg-indigo-600 text-white rounded-br-md" : "bg-white text-slate-800 border border-slate-100 rounded-bl-md"}`}>
                {m.role === "ai" && (
                  <button onClick={() => speak(m.text, user?.accent)} className="float-right ml-2 mt-1 text-slate-300 hover:text-indigo-500">
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {thinking && <div className="flex gap-1 px-4 py-2"><Dot /><Dot d={0.15} /><Dot d={0.3} /></div>}
      </div>

      <div className="bg-white border-t border-slate-100 px-5 pt-4 pb-8">
        {!supported ? (
          <p className="text-center text-sm text-red-500">Voice input isn't supported on this browser. Try Chrome.</p>
        ) : (
          <>
            <p className="text-center text-sm text-slate-500 h-10 mb-1 overflow-hidden">
              {listening ? (transcript || "Listening…") : ending ? "Scoring your session…" : "Tap the mic and speak your reply"}
            </p>
            <div className="flex justify-center">
              <MicButton listening={listening} disabled={thinking || speaking || ending} onClick={handleMic} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Dot({ d = 0 }) {
  return <motion.span className="w-2 h-2 rounded-full bg-slate-300" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: d }} />;
}