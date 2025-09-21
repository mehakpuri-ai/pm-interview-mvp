import { v4 as uuidv4 } from "uuid";

export function createSession(skillLevel: "Beginner" | "Intermediate") {
  const sessionId = uuidv4();
  if (typeof window !== "undefined") {
    localStorage.setItem("session_id", sessionId);
    localStorage.setItem("skill_level", skillLevel);
  }
  console.log("📊 Metric: session_created", { sessionId, skillLevel });
  return sessionId;
}

export function getSessionId(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("session_id");
  }
  return null;
}
