export const GOALS = [
  { key: "better_job", label: "Get a better job", emoji: "💼" },
  { key: "speak_confidently", label: "Speak confidently", emoji: "🗣️" },
  { key: "business_english", label: "Business English", emoji: "📈" },
  { key: "ielts", label: "IELTS", emoji: "🎓" },
  { key: "travel", label: "Travel", emoji: "✈️" },
];

export const LEVELS = [
  { key: "A2", label: "A2", desc: "Elementary" },
  { key: "B1", label: "B1", desc: "Intermediate" },
  { key: "B2", label: "B2", desc: "Upper Intermediate" },
  { key: "C1", label: "C1", desc: "Advanced" },
];

export const INDUSTRIES = [
  { key: "it", label: "IT", emoji: "💻" },
  { key: "finance", label: "Finance", emoji: "💰" },
  { key: "engineering", label: "Engineering", emoji: "⚙️" },
  { key: "healthcare", label: "Healthcare", emoji: "🩺" },
  { key: "marketing", label: "Marketing", emoji: "📣" },
  { key: "sales", label: "Sales", emoji: "🤝" },
  { key: "customer_support", label: "Customer Support", emoji: "🎧" },
  { key: "teaching", label: "Teaching", emoji: "📚" },
];

export const ACCENTS = [
  { key: "american", label: "American", flag: "🇺🇸" },
  { key: "british", label: "British", flag: "🇬🇧" },
  { key: "australian", label: "Australian", flag: "🇦🇺" },
  { key: "canadian", label: "Canadian", flag: "🇨🇦" },
];

export const SCENARIOS = [
  { key: "interview", label: "Job Interview", emoji: "🎯", desc: "Practice answering interview questions", persona: "a friendly but professional hiring manager" },
  { key: "meeting", label: "Team Meeting", emoji: "👥", desc: "Discuss projects and share updates", persona: "a team leader running a status meeting" },
  { key: "small_talk", label: "Small Talk", emoji: "☕", desc: "Casual office conversation", persona: "a friendly colleague making small talk" },
  { key: "customer_call", label: "Customer Call", emoji: "📞", desc: "Handle a customer over the phone", persona: "a customer who needs help with a product" },
  { key: "negotiation", label: "Negotiation", emoji: "⚖️", desc: "Negotiate terms and salary", persona: "a counterpart in a business negotiation" },
  { key: "presentation", label: "Presentation", emoji: "📊", desc: "Present ideas to an audience", persona: "an engaged audience member asking questions" },
  { key: "networking", label: "Networking Event", emoji: "🥂", desc: "Introduce yourself and connect", persona: "a professional at a networking event" },
];

export function labelFor(list, key) {
  return list.find((x) => x.key === key)?.label || key;
}