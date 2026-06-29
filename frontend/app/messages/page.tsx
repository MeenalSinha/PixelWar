"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRealtime } from "@/lib/useRealtime";

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const [chatMsg, setChatMsg] = useState("");

  const { data: player } = useQuery({ queryKey: ["player"], queryFn: api.me });

  const { data: chatHistory, isLoading } = useQuery({ 
    queryKey: ["chat", "global"], 
    queryFn: () => api.chatMessages("global"),
  });

  const chatMutation = useMutation({
    mutationFn: api.postChatMessage,
    onSuccess: () => {
      setChatMsg("");
    }
  });

  useRealtime((event) => {
    if (event.type === "CHAT_MESSAGE" && event.message.scope === "global") {
      queryClient.invalidateQueries({ queryKey: ["chat", "global"] });
    }
  });

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    chatMutation.mutate({ scope: "global", text: chatMsg, username: player?.username || "Unknown" });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar active="/messages" />
      <div className="flex-1 ml-56 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 p-6 bg-pw-cream flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h1 className="pixel-font text-pw-navy" style={{ fontSize: 14 }}>GLOBAL MESSAGES</h1>
          </div>

          <div className="flex-1 pw-card flex flex-col" style={{ minHeight: 600 }}>
            <header className="pw-card-navy-header">🌍 WORLD CHAT</header>
            
            <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
              {isLoading && (
                <div className="text-center text-gray-400 pixel-font mt-10" style={{ fontSize: 8 }}>Loading messages...</div>
              )}
              {!isLoading && (!chatHistory || chatHistory.length === 0) && (
                <div className="text-center text-gray-400 pixel-font mt-10" style={{ fontSize: 8 }}>No messages yet. Be the first!</div>
              )}
              {chatHistory?.map((msg: any) => (
                <div key={msg.messageId || msg.id} className="flex gap-3 items-start animate-slide-right">
                  <div className="w-8 h-8 flex-shrink-0 border-2 border-pw-border flex items-center justify-center bg-pw-sky">
                    <span className="material-symbols-outlined text-pw-navy" style={{ fontSize: 14 }}>person</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="pixel-font" style={{ fontSize: 8, color: "#1a365d" }}>{msg.username}</span>
                      <span className="pixel-font text-gray-400" style={{ fontSize: 6 }}>
                        {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="pixel-font text-pw-navy mt-1" style={{ fontSize: 7, lineHeight: 1.7 }}>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form className="border-t-4 border-pw-border p-4 flex gap-3 bg-white bg-opacity-50" onSubmit={handleSendChat}>
              <input 
                type="text" 
                value={chatMsg} 
                onChange={(e) => setChatMsg(e.target.value)}
                placeholder="Broadcast to the world..."
                className="pw-input flex-1"
              />
              <button 
                type="submit" 
                disabled={chatMutation.isPending}
                className="pixel-btn pixel-btn-gold px-8 py-3 pixel-shadow disabled:opacity-50" 
                style={{ fontSize: 8 }}
              >
                {chatMutation.isPending ? "SENDING..." : "SEND"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
