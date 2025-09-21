"use client";
import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RecordingWidget() {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const options: MediaRecorderOptions = { mimeType: "video/webm;codecs=vp8,opus" };
      const mediaRecorder = new MediaRecorder(stream, options);

      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);

        const dur = Date.now() - (startTimeRef.current || Date.now());
        setDuration(Math.round(dur / 1000));

        console.log("📊 Metric: recording_completed", { duration: Math.round(dur / 1000), size: blob.size });

        // Upload to Supabase storage
        await uploadToSupabase(blob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      console.log("📊 Metric: recording_started");
    } catch (err) {
      console.error("camera permission or start error", err);
      alert("Cannot access camera/microphone. Check browser permissions.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const uploadToSupabase = async (blob: Blob) => {
    try {
      setUploading(true);
      const sessionId = typeof window !== "undefined" ? localStorage.getItem("session_id") : null;
      const questionIndex = 1; // For MVP: you can wire actual questionId in later
      const filename = `${sessionId ?? "anon"}_${questionIndex}_${Date.now()}.webm`;

      // Upload to Supabase storage (recordings bucket)
      const { error: uploadError } = await supabase.storage
        .from("recordings")
        .upload(filename, blob, { contentType: "video/webm" });

      if (uploadError) {
        console.error("Supabase upload error", uploadError);
        alert("Upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }

      // Get public URL (if bucket is public)
      const { data: urlData } = supabase.storage.from("recordings").getPublicUrl(filename);
      const publicUrl = urlData?.publicUrl ?? null;

      // Notify server to insert metadata and (optionally) start processing
      const resp = await fetch("/api/recording", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: questionIndex,
          filename,
          publicUrl,
          durationSeconds: Math.round(duration),
        }),
      });

      const j = await resp.json();
      console.log("server recording response", j);
    } catch (err) {
      console.error("upload error", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
      {!isRecording && (
        <button
          onClick={startRecording}
          style={{ padding: "10px 16px", background: "#0ea5a4", color: "white", borderRadius: 6 }}
          disabled={uploading}
        >
          🎥 Start Recording
        </button>
      )}
      {isRecording && (
        <button
          onClick={stopRecording}
          style={{ padding: "10px 16px", background: "#ef4444", color: "white", borderRadius: 6 }}
        >
          ⏹ Stop Recording
        </button>
      )}

      {uploading && <div>Uploading to Supabase…</div>}

      {videoUrl && (
        <div>
          <p>Recorded video (duration: {duration}s)</p>
          <video src={videoUrl} controls style={{ width: "100%", maxWidth: 400 }} />
        </div>
      )}
    </div>
  );
}
