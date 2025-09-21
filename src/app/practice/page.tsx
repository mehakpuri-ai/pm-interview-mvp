"use client";
import { useEffect, useState } from "react";
import RecordingWidget from "@/components/RecordingWidget";

export default function PracticePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSessionId(localStorage.getItem("session_id"));
    }
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Practice Interview</h1>
      <p style={{ color: "#666" }}>Session: {sessionId ?? "no session"}</p>
      <RecordingWidget />
    </main>
  );
}
