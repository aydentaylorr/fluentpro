import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Sparkles, Building2, ChevronRight, CheckCircle2, X, Briefcase } from "lucide-react";

const PLANS = [
  {
    key: "free",
    name: "Free",
    icon: Sparkles,
    tagline: "People who want to try the app",
    color: "from-slate-400 to-slate-500",
    badge: null,
    monthly: 0,
    yearly: 0,
    features: [
      "10 min AI conversation/day",
      "1 Business English lesson/week",
      "Basic grammar corrections",
      "1 Daily Speaking Challenge",
      "Limited vocabulary bank",
      "Progress tracking (7 days)",
      "One practice scenario (Small Talk)",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    icon: Crown,
    tagline: "Professionals improving consistently",
    color: "from-indigo-500 to-violet-600",
    badge: "Most Popular",
    monthly: 9.99,
    yearly: 89.99,
    features: [
      "Everything in Free",
      "Unlimited AI conversations",
      "Detailed pronunciation analysis",
      "Grammar explanations",
      "Vocabulary feedback",
      "Business English lessons",
      "Interview & meeting practice",
      "Presentation practice",
      "Email & phrase library",
      "Personalized learning path",
      "Weekly progress reports",
      "Unlimited conversation history",
    ],
  },
  {
    key: "career",
    name: "Career",
    icon: Briefcase,
    tagline: "Job seekers & career growth",
    color: "from-amber-500 to-orange-600",
    badge: null,
    monthly: 19.99,
    yearly: 179.99,
    features: [
      "Everything in Pro",
      "AI mock interviews",
      "CV feedback",
      "Cover letter assistant",
      "LinkedIn profile review",
      "Salary negotiation practice",
      "STAR interview coaching",
      "Interview scorecards",
      "Recruiter-style feedback",
      "Industry-specific questions",
      "Confidence coaching",
    ],
  },
  {
    key: "teams",
    name: "Teams",
    icon: Building2,
    tagline: "Companies training employees",
    color: "from-teal-500 to-emerald-600",
    badge: null,
    monthly: 12,
    yearly: null,
    perUser: true,
    features: [
      "Everything in Career",
      "Team dashboard",
      "Employee progress tracking",
      "Learning assignments",
      "Manager reports",
      "Custom company vocabulary",
      "Industry-specific scenarios",
      "Usage analytics",
      "Admin controls",
      "Priority support",
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);

  return (
    <div className="px-5 pt-12 pb-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Choose your plan</h1>
        <p className="text-slate-500 mt-2">Invest in your English. Cancel anytime.</p>
      </div>

      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={`text-sm font-medium ${!yearly ? "text-slate-900" : "text-slate-400"}`}>Monthly</span>
        <button onClick={() => setYearly(!yearly)} className="relative w-12 h-7 rounded-full bg-slate-200 transition-colors">
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${yearly ? "left-6 bg-indigo-600" : "left-1"}`} />
        </button>
        <span className={`text-sm font-medium ${yearly ? "text-slate-900" : "text-slate-400"}`}>Yearly</span>
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Save 25%</span>
      </div>

      <div className="space-y-4">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`relative rounded-3xl border-2 p-5 ${plan.key === "pro" ? "border-indigo-500 shadow-lg shadow-indigo-100" : "border-slate-100 bg-white"}`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-5 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">⭐ {plan.badge}</span>
            )}
            <div className="flex items-center gap-3 mb-1">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                <plan.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">{plan.name}</h2>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-4">{plan.tagline}</p>

            <div className="flex items-baseline gap-1 mb-4">
              {plan.perUser ? (
                <>
                  <span className="text-3xl font-bold text-slate-900">${plan.monthly}</span>
                  <span className="text-sm text-slate-400">/user/month</span>
                </>
              ) : plan.monthly === 0 ? (
                <span className="text-3xl font-bold text-slate-900">Free</span>
              ) : (
                <>
                  <span className="text-3xl font-bold text-slate-900">${yearly ? (plan.yearly / 12).toFixed(2) : plan.monthly}</span>
                  <span className="text-sm text-slate-400">/month{yearly && plan.yearly ? `, billed $${plan.yearly}/yr` : ""}</span>
                </>
              )}
            </div>

            {plan.perUser && (
              <p className="text-xs text-slate-400 mb-3 bg-slate-50 rounded-lg px-3 py-2">Min. 10 users · 20 employees = $240/mo</p>
            )}

            <ul className="space-y-2 mb-5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate("/")}
              className={`w-full rounded-2xl py-3 font-medium transition-colors ${
                plan.key === "free"
                  ? "bg-slate-100 text-slate-700"
                  : plan.key === "pro"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-white"
              }`}
            >
              {plan.key === "free" ? "Current plan" : plan.perUser ? "Contact sales" : `Get ${plan.name}`}
            </button>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">Prices in USD. Secure payment via Stripe.</p>
    </div>
  );
}