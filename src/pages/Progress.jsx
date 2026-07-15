import React, { useEffect, useState } from "react";
import { base44 } from "@/api/client";
import ScoreRing from "@/components/coach/ScoreRing";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Clock, BookMarked, Award, Loader2, Flame } from "lucide-react";
import { format } from "date-fns";

const AREAS = [
  { key: "grammar_score", label: "Grammar", color: "#4f46e5" },
  { key: "pronunciation_score", label: "Pronunciation", color: "#0891b2" },
  { key: "vocabulary_score", label: "Vocabulary", color: "#db2777" },
  { key: "confidence_score", label: "Confidence", color: "#ea580c" },
];

export default function Progress() {
  const [sessions, setSessions] = useState(null);
  const [user, setUser] = useState(null);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setUser);
    base44.entities.PracticeSession.filter({ status: "completed" }, "-created_date", 100).then(setSessions);
    base44.entities.VocabularyPhrase.filter({ saved: true }).then((s) => setSavedCount(s.length));
  }, []);

  if (!sessions) return <div className="flex justify-center pt-40"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>;

  const scored = sessions.filter((s) => s.grammar_score);
  const avg = (key) => scored.length ? Math.round(scored.reduce((a, s) => a + (s[key] || 0), 0) / scored.length) : 0;
  const hours = (sessions.reduce((a, s) => a + (s.duration_minutes || 0), 0) / 60).toFixed(1);
  const chartData = [...scored].reverse().slice(-7).map((s) => ({
    name: format(new Date(s.created_date), "d MMM"),
    score: Math.round(AREAS.reduce((a, x) => a + (s[x.key] || 0), 0) / AREAS.length),
  }));

  return (
    <div className="px-5 pt-12">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your progress</h1>
      <p className="text-slate-500 mt-1 mb-5">Weekly performance across all skills.</p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat icon={Clock} label="Hours" value={hours} />
        <Stat icon={BookMarked} label="Saved words" value={savedCount} />
        <Stat icon={Flame} label="Streak" value={user?.streak || 0} />
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-5">
        <p className="font-semibold text-slate-900 mb-3">Weekly improvement</p>
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 12, border: "1px solid #eef2ff", fontSize: 12 }} />
              <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-slate-400 py-8 text-center">Complete a practice session to see your progress.</p>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1 bg-white rounded-2xl p-4 border border-slate-100">
        {AREAS.map((a) => <ScoreRing key={a.key} value={avg(a.key)} size={54} label={a.label} color={a.color} />)}
      </div>

      {scored.length >= 3 && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
          <Award className="w-8 h-8 text-amber-500" />
          <div>
            <p className="font-semibold text-slate-900">Consistent Speaker</p>
            <p className="text-sm text-slate-500">You've completed {scored.length} scored sessions. Keep it up!</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
      <Icon className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}