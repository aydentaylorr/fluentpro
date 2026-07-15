import { useState, useRef, useCallback, useEffect } from "react";

// Browser speech recognition (STT) + speech synthesis (TTS)
export function useSpeech() {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);
  const finalRef = useRef("");

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalRef.current += r[0].transcript + " ";
        else interim += r[0].transcript;
      }
      setTranscript((finalRef.current + interim).trim());
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    return () => {
      try { rec.stop(); } catch (e) { /* noop */ }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    finalRef.current = "";
    setTranscript("");
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (e) { /* already started */ }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch (e) { /* noop */ }
    setListening(false);
  }, []);

  const accentLang = { american: "en-US", british: "en-GB", australian: "en-AU", canadian: "en-CA" };

  const speak = useCallback((text, accent = "american") => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = accentLang[accent] || "en-US";
    u.rate = 0.95;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { listening, speaking, transcript, supported, startListening, stopListening, speak, stopSpeaking, setTranscript };
}