"use client";
import { useState } from "react";

export default function TextToSpeech() {
  const [text, setText] = useState("");

  const handleSpeak = () => {
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; // you can change this (e.g. "es-ES", "am-ET")
    utterance.rate = 1; // speed (0.5 = slow, 2 = fast)
    utterance.pitch = 1; // tone (0 = low, 2 = high)
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 rounded-2xl shadow-md bg-white">
      <h2 className="text-xl font-semibold">Text to Speech (Browser API)</h2>

      <textarea
        className="w-full p-2 border rounded-md"
        rows={4}
        placeholder="Type something to speak..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleSpeak}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        🔊 Speak
      </button>
    </div>
  );
}
