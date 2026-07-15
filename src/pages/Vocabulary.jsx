import React, { useEffect, useState } from "react";
import { base44 } from "@/api/client";
import { INDUSTRIES, labelFor } from "@/lib/coachConfig";
import { useSpeech } from "@/hooks/useSpeech";
import { Volume2, Bookmark, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Vocabulary() {
  const { speak } = useSpeech();
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    const list = await base44.entities.VocabularyPhrase.list("-created_date", 50);
    setPhrases(list);
    setLoading(false);
    if (list.length === 0) generate();
  };
  useEffect(() => { load(); }, []);

  const generate = async () => {
    setGenerating(true);
    const u = await base44.auth.me();
    const industry = u?.industry ? labelFor(INDUSTRIES, u.industry) : "general business";
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Give 6 useful Business English phrases or idioms for a professional working in ${industry}. For each: the phrase, a plain meaning, an example sentence, and a short category.`,
      response_json_schema: {
        type: "object",
        properties: { phrases: { type: "array", items: { type: "object", properties: {
          phrase: { type: "string" }, meaning: { type: "string" }, example: { type: "string" }, category: { type: "string" },
        } } } },
      },
    });
    await base44.entities.VocabularyPhrase.bulkCreate(res.phrases || []);
    setGenerating(false);
    load();
  };

  const toggleSave = async (p) => {
    await base44.entities.VocabularyPhrase.update(p.id, { saved: !p.saved });
    setPhrases((prev) => prev.map((x) => (x.id === p.id ? { ...x, saved: !x.saved } : x)));
  };

  return (
    <div className="px-5 pt-12">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vocabulary</h1>
      <p className="text-slate-500 mt-1 mb-5">Business phrases tailored to your industry.</p>

      <button onClick={generate} disabled={generating} className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 mb-5 bg-indigo-50 text-indigo-600 font-medium disabled:opacity-60">
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {generating ? "Generating phrases…" : "Get new phrases"}
      </button>

      {loading ? (
        <div className="flex justify-center pt-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
      ) : (
        <div className="space-y-3">
          {phrases.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="rounded-2xl p-4 bg-white border border-slate-100">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {p.category && <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-500">{p.category}</span>}
                  <p className="font-semibold text-slate-900 mt-0.5">"{p.phrase}"</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => speak(p.phrase)} className="p-1.5 text-slate-400 hover:text-indigo-500"><Volume2 className="w-4 h-4" /></button>
                  <button onClick={() => toggleSave(p)} className={`p-1.5 ${p.saved ? "text-indigo-600" : "text-slate-300"}`}><Bookmark className={`w-4 h-4 ${p.saved ? "fill-indigo-600" : ""}`} /></button>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-1">{p.meaning}</p>
              {p.example && <p className="text-sm text-slate-400 italic mt-1.5 border-l-2 border-slate-100 pl-2">{p.example}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}