"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Voice-note input using the browser's Web Speech API.
 *
 * Dictation runs on the device — nothing is uploaded. The language toggle
 * switches between Saudi Arabic and English recognition, which matters because
 * the engine needs to know which one it is listening for.
 *
 * When the browser has no speech recognition (Firefox, older Safari, most
 * in-app browsers) the button hides itself and the field it decorates keeps
 * working as an ordinary text input.
 */
export default function VoiceInput({
  onText,
  defaultLang = "ar-SA",
  size = "md",
}: {
  onText: (text: string) => void;
  defaultLang?: "ar-SA" | "en-US";
  size?: "sm" | "md";
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState<"ar-SA" | "en-US">(defaultLang);
  const recRef = useRef<any>(null);

  // Feature-detect after mount so the server and client render the same markup.
  useEffect(() => {
    const w = window as any;
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        /* already stopped */
      }
    };
  }, []);

  if (!supported) return null;

  function toggle() {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.continuous = true;
    rec.onresult = (e: any) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) text += e.results[i][0].transcript + " ";
      }
      if (text.trim()) onText(text.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={listening}
        title={listening ? "Stop dictation" : "Dictate — الإملاء الصوتي"}
        className={`${dim} grid place-items-center rounded-full border transition ${
          listening
            ? "mic-pulse border-red-600 bg-red-600 text-white"
            : "border-brand-900/15 bg-white text-brand-700 hover:border-gold-400 hover:text-brand-900"
        }`}
      >
        <span aria-hidden>🎤</span>
        <span className="sr-only">{listening ? "Stop dictation" : "Start dictation"}</span>
      </button>
      <button
        type="button"
        onClick={() => setLang(lang === "ar-SA" ? "en-US" : "ar-SA")}
        title="Switch dictation language"
        className="rounded px-1 text-[10px] font-bold text-brand-900/45 hover:text-brand-800"
      >
        {lang === "ar-SA" ? "ع" : "EN"}
      </button>
    </span>
  );
}
