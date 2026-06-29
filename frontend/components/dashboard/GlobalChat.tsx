"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useRealtime } from "@/lib/useRealtime";

export default function GlobalChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.chatMessages("global").then(setMessages).catch(() => setMessages([]));
  }, []);

  useRealtime((event) => {
    if (event.type === "CHAT_MESSAGE" && (event as any).message.scope === "global") {
      setMessages((prev) => [...prev, (event as any).message]);
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api.postChatMessage({ scope: "global", text, username: "Commander" });
      setText("");
    } catch {
      // If unauthenticated, the request simply fails — surfaced via console for now.
    }
  }

  return (
    <div className="bg-pw-navy text-white pixel-border p-4 flex flex-col h-72">
      <h3 className="pixel-font text-[10px] mb-2">GLOBAL CHAT</h3>
      <div className="flex-1 overflow-y-auto text-xs space-y-1 mb-2">
        {messages.map((m) => (
          <p key={m.messageId}>
            <span className="text-pw-gold font-bold">{m.username}:</span> {m.text}
          </p>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Say something..."
          className="flex-1 text-pw-navy px-2 py-1 rounded text-xs"
        />
        <button type="submit" className="pixel-font text-[8px] bg-pw-gold text-pw-navy px-2 py-1 pixel-border">
          SEND
        </button>
      </form>
    </div>
  );
}
