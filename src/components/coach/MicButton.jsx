import React from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function MicButton({ listening, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} className="relative flex items-center justify-center">
      {listening && (
        <motion.span
          className="absolute rounded-full bg-red-400/30"
          initial={{ width: 72, height: 72, opacity: 0.7 }}
          animate={{ width: 110, height: 110, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        />
      )}
      <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center shadow-lg transition-colors ${
        disabled ? "bg-slate-200" : listening ? "bg-red-500 shadow-red-200" : "bg-indigo-600 shadow-indigo-200"
      }`}>
        {disabled ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : listening ? <Square className="w-6 h-6 text-white fill-white" /> : <Mic className="w-7 h-7 text-white" />}
      </div>
    </button>
  );
}