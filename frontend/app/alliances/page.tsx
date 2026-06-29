"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRealtime } from "@/lib/useRealtime";

export default function AlliancesPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"list" | "my-alliance" | "create">("list");
  
  const [createName, setCreateName] = useState("");
  const [chatMsg, setChatMsg] = useState("");
  const [status, setStatus] = useState("");

  const { data: alliances, isLoading } = useQuery({ queryKey: ["alliances"], queryFn: api.alliances });
  const { data: player } = useQuery({ queryKey: ["player"], queryFn: api.me });

  const myAllianceId = player?.allianceId;
  const myAlliance = alliances?.find((a: any) => a.allianceId === myAllianceId);

  const { data: chatHistory } = useQuery({ 
    queryKey: ["chat", "alliance", myAllianceId], 
    queryFn: () => api.chatMessages("alliance", myAllianceId as string),
    enabled: !!myAllianceId
  });

  const joinMutation = useMutation({
    mutationFn: api.joinAlliance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player"] });
      queryClient.invalidateQueries({ queryKey: ["alliances"] });
      setTab("my-alliance");
      setStatus("Joined alliance!");
      setTimeout(() => setStatus(""), 3000);
    },
    onError: (err: any) => {
      setStatus(err.message || "Failed to join alliance");
      setTimeout(() => setStatus(""), 3000);
    }
  });

  const createMutation = useMutation({
    mutationFn: api.createAlliance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player"] });
      queryClient.invalidateQueries({ queryKey: ["alliances"] });
      setTab("my-alliance");
      setStatus("Alliance created!");
      setTimeout(() => setStatus(""), 3000);
    },
    onError: (err: any) => {
      setStatus(err.message || "Failed to create alliance");
      setTimeout(() => setStatus(""), 3000);
    }
  });

  const chatMutation = useMutation({
    mutationFn: api.postChatMessage,
    onSuccess: () => {
      setChatMsg("");
    }
  });

  useRealtime((event) => {
    if (event.type === "CHAT_MESSAGE" && event.message.scope === "alliance") {
      queryClient.invalidateQueries({ queryKey: ["chat", "alliance", myAllianceId] });
    }
    if (event.type === "ALLIANCE_CREATED" || event.type === "ALLIANCE_JOINED") {
      queryClient.invalidateQueries({ queryKey: ["alliances"] });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(createName);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || !myAllianceId) return;
    chatMutation.mutate({ scope: "alliance", allianceId: myAllianceId, text: chatMsg, username: player?.username || "Unknown" });
  };

  // Ensure user is shown the correct tab automatically
  useEffect(() => {
    if (myAllianceId && tab === "create") {
      setTab("my-alliance");
    } else if (!myAllianceId && tab === "my-alliance") {
      setTab("list");
    }
  }, [myAllianceId, tab]);

  return (
    <div className="flex min-h-screen">
      <Sidebar active="/alliances" />
      <div className="flex-1 ml-56 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 p-6 bg-pw-cream">
          <div className="flex items-center justify-between mb-6">
            <h1 className="pixel-font text-pw-navy" style={{ fontSize: 14 }}>ALLIANCES</h1>
            {!myAllianceId && (
              <button onClick={() => setTab("create")}
                className="pixel-btn pixel-btn-gold px-6 py-3 pixel-shadow" style={{ fontSize: 9 }}>
                + CREATE ALLIANCE
              </button>
            )}
          </div>

          <div className="flex border-4 border-pw-border mb-6">
            <button onClick={() => setTab("list")}
              className={`flex-1 py-3 pixel-font border-r-4 border-pw-border last:border-r-0 ${tab === "list" ? "bg-pw-gold text-pw-border" : "bg-pw-cream text-pw-navy hover:bg-gray-100"}`}
              style={{ fontSize: 9 }}>
              FIND ALLIANCE
            </button>
            {myAllianceId && (
              <button onClick={() => setTab("my-alliance")}
                className={`flex-1 py-3 pixel-font border-r-4 border-pw-border last:border-r-0 ${tab === "my-alliance" ? "bg-pw-gold text-pw-border" : "bg-pw-cream text-pw-navy hover:bg-gray-100"}`}
                style={{ fontSize: 9 }}>
                MY ALLIANCE
              </button>
            )}
            {!myAllianceId && (
              <button onClick={() => setTab("create")}
                className={`flex-1 py-3 pixel-font border-r-4 border-pw-border last:border-r-0 ${tab === "create" ? "bg-pw-gold text-pw-border" : "bg-pw-cream text-pw-navy hover:bg-gray-100"}`}
                style={{ fontSize: 9 }}>
                CREATE NEW
              </button>
            )}
          </div>

          {status && (
            <div className="mb-4 p-3 bg-pw-navy border-4 border-pw-border text-pw-cream pixel-font text-center" style={{ fontSize: 8 }}>
              {status}
            </div>
          )}

          {tab === "list" && (
            <div className="pw-card">
              <header className="pw-card-navy-header">🛡️ ACTIVE ALLIANCES</header>
              <div className="divide-y-4 divide-pw-border">
                <div className="grid grid-cols-5 gap-4 px-5 py-2 bg-gray-100">
                  {["Alliance", "Members", "Territory", "Leader", "Action"].map((h) => (
                    <span key={h} className="pixel-font text-gray-500" style={{ fontSize: 7 }}>{h}</span>
                  ))}
                </div>
                {isLoading && (
                  <div className="p-8 text-center pixel-font text-gray-500" style={{ fontSize: 8 }}>Loading alliances...</div>
                )}
                {(!alliances || alliances.length === 0) && !isLoading && (
                  <div className="p-8 text-center pixel-font text-gray-500" style={{ fontSize: 8 }}>No alliances exist yet.</div>
                )}
                {alliances?.map((a: any) => {
                  const isMember = a.allianceId === myAllianceId;
                  return (
                    <div key={a.allianceId} className="grid grid-cols-5 gap-4 px-5 py-4 items-center hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border-4 border-pw-border pixel-shadow-sm flex items-center justify-center bg-pw-navy">
                          <span className="pixel-font text-white" style={{ fontSize: 6 }}>{a.name.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <span className="pixel-font text-pw-navy" style={{ fontSize: 8 }}>{a.name}</span>
                      </div>
                      <span className="pixel-font" style={{ fontSize: 8 }}>{(a.memberIds || []).length}</span>
                      <span className="pixel-font" style={{ fontSize: 8 }}>{a.territory || 0}</span>
                      <span className="pixel-font text-gray-500" style={{ fontSize: 7 }}>{a.leaderId === (player?.playerId || player?.id) ? "You" : (a.leaderUsername || a.leaderId)}</span>
                      <div>
                        {isMember ? (
                          <span className="pw-badge pw-badge-green" style={{ fontSize: 7 }}>MEMBER</span>
                        ) : myAllianceId ? (
                          <span className="pixel-font text-gray-400" style={{ fontSize: 6 }}>Already in an alliance</span>
                        ) : (
                          <button 
                            onClick={() => joinMutation.mutate(a.allianceId)}
                            disabled={joinMutation.isPending}
                            className="pixel-btn pixel-btn-navy px-3 py-2 pixel-shadow disabled:opacity-50" style={{ fontSize: 7 }}>
                            {joinMutation.isPending ? "..." : "JOIN"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "my-alliance" && myAlliance && (
            <div className="grid grid-cols-3 gap-6">
              {/* Alliance info */}
              <div className="col-span-1 flex flex-col gap-6">
                <div className="pw-card">
                  <div className="p-5 text-center border-b-4 border-pw-border bg-pw-navy">
                    <div className="w-16 h-16 mx-auto border-4 border-pw-border pixel-shadow bg-white flex items-center justify-center mb-2">
                      <span className="pixel-font text-pw-navy" style={{ fontSize: 10 }}>{myAlliance.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <p className="pixel-font text-white" style={{ fontSize: 10 }}>{myAlliance.name}</p>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {[
                      { label: "Members",   value: (myAlliance.memberIds || []).length },
                      { label: "Territory", value: myAlliance.territory || 0 },
                    ].map((s) => (
                      <div key={s.label} className="border-2 border-pw-border p-2 text-center">
                        <p className="pixel-font text-gray-500" style={{ fontSize: 6 }}>{s.label}</p>
                        <p className="pixel-font text-pw-navy mt-1" style={{ fontSize: 8 }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Members */}
                <div className="pw-card">
                  <header className="pw-card-header">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>groups</span>
                    MEMBERS ({(myAlliance.memberIds || []).length})
                  </header>
                  <div className="divide-y-2 divide-gray-200">
                    {(myAlliance.memberIds || []).map((m: any, i: number) => (
                      <div key={m} className="flex items-center gap-3 px-4 py-3">
                        <div className="relative w-8 h-8 bg-pw-sky border-2 border-pw-border flex items-center justify-center">
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
                        </div>
                        <div className="flex-1">
                          <p className="pixel-font" style={{ fontSize: 8 }}>{m}</p>
                          <p className="pixel-font text-gray-400" style={{ fontSize: 6 }}>{m === myAlliance.leaderId ? "Leader" : "Member"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alliance Chat */}
              <div className="col-span-2 pw-card flex flex-col" style={{ minHeight: 500 }}>
                <header className="pw-card-navy-header">💬 ALLIANCE CHAT</header>
                <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
                  {!chatHistory?.length && (
                    <div className="text-center text-gray-400 pixel-font mt-10" style={{ fontSize: 8 }}>No messages yet.</div>
                  )}
                  {chatHistory?.map((msg: any) => (
                    <div key={msg.messageId || msg.id} className="flex gap-3 items-start animate-slide-right">
                      <div className="w-8 h-8 flex-shrink-0 border-2 border-pw-border flex items-center justify-center bg-pw-gold">
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
                <form className="border-t-4 border-pw-border p-4 flex gap-3" onSubmit={handleSendChat}>
                  <input type="text" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)}
                    placeholder="Type your message..."
                    className="pw-input flex-1"
                  />
                  <button type="submit" disabled={chatMutation.isPending}
                    className="pixel-btn pixel-btn-gold px-6 py-3 pixel-shadow disabled:opacity-50" style={{ fontSize: 8 }}>
                    SEND
                  </button>
                </form>
              </div>
            </div>
          )}

          {tab === "create" && (
            <div className="max-w-lg mx-auto pw-card">
              <header className="pw-card-navy-header">⚔️ CREATE ALLIANCE</header>
              <form className="p-6 flex flex-col gap-5" onSubmit={handleCreate}>
                <div>
                  <label className="pixel-font block mb-2" style={{ fontSize: 8 }}>Alliance Name</label>
                  <input type="text" required value={createName} onChange={(e) => setCreateName(e.target.value)} className="pw-input" placeholder="e.g. Iron Brotherhood" />
                </div>
                
                <button type="submit" disabled={createMutation.isPending}
                  className="pixel-btn pixel-btn-gold py-4 pixel-shadow w-full disabled:opacity-50" style={{ fontSize: 10 }}>
                  {createMutation.isPending ? "CREATING..." : "CREATE ALLIANCE"}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
