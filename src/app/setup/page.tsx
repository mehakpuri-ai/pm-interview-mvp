"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSessionId } from "@/lib/session";

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleContinue = () => {
    const sessionId = getSessionId();
    if (typeof window !== "undefined") {
      localStorage.setItem("name", name);
      if (email) localStorage.setItem("email", email);
    }
    console.log("📊 Metric: setup_completed", {
      sessionId,
      name,
      emailProvided: !!email,
    });
    router.push("/practice");
  };

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Quick Setup</h1>
      <p style={{ marginBottom: 16, color: "#666" }}>
        Answer up to 5 PM questions. Skip any. Get instant AI feedback.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 320 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email (optional)" type="email" style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleContinue} style={{ padding: "10px 16px", background: "#0ea5a4", color: "white", borderRadius: 6 }}>
            Continue →
          </button>
        </div>
      </div>
    </main>
  );
}
