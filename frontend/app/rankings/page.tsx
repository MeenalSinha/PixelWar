"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const BADGES = ["👑", "🥇", "🥈", "🥉", "⚔️", "❄️", "🌊", "🔥", "⚙️", "🌲"];

export default function RankingsPage() {
  const [tab, setTab] = useState<"global" | "alliances" | "friends">("global");
  const [period, setPeriod] = useState<"all" | "weekly" | "daily">("all");

  const { data: player } = useQuery({ queryKey: ["player"], queryFn: api.me });
  const { data: rankings, isLoading: loadingRankings } = useQuery({ queryKey: ["rankings"], queryFn: api.rankings });
  const { data: alliances, isLoading: loadingAlliances } = useQuery({ queryKey: ["alliances"], queryFn: api.alliances });

  const sortedAlliances = alliances ? [...alliances].sort((a, b) => (b.territory || 0) - (a.territory || 0)) : [];
  const myRankIndex = rankings ? rankings.findIndex((r: any) => (r.playerId || r.id) === (player?.playerId || player?.id)) : -1;
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : "-";

  return (
    <div className="flex min-h-screen">
      <Sidebar active="/rankings" />
      <div className="flex-1 ml-56 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 p-6 bg-pw-cream">
          <div className="flex items-center justify-between mb-6">
            <h1 className="pixel-font text-pw-navy" style={{ fontSize: 14 }}>🏆 LEADERBOARDS</h1>
            <div className="flex border-4 border-pw-border">
              {(["all", "weekly", "daily"] as const).map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-4 py-2 pixel-font border-r-4 border-pw-border last:border-r-0 ${period === p ? "bg-pw-gold text-pw-border" : "bg-pw-cream text-pw-navy hover:bg-gray-100"}`}
                  style={{ fontSize: 8 }}>
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* My rank highlight */}
          <div className="pw-card border-pw-gold mb-6 flex items-center gap-6 p-4"
            style={{ borderColor: "#facc15" }}>
            <div className="w-16 h-16 bg-pw-gold border-4 border-pw-border pixel-shadow flex items-center justify-center">
              <span className="pixel-font text-pw-border" style={{ fontSize: 18 }}>⚔️</span>
            </div>
            <div className="flex-1">
              <p className="pixel-font text-pw-navy mb-1" style={{ fontSize: 8 }}>YOUR RANK</p>
              <p className="pixel-font text-pw-gold" style={{ fontSize: 20 }}>#{myRank}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Score",     value: (player?.score || 0).toLocaleString() },
                { label: "Alliance",  value: player?.allianceId || "None" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="pixel-font text-gray-500" style={{ fontSize: 7 }}>{s.label}</p>
                  <p className="pixel-font text-pw-navy mt-1" style={{ fontSize: 11 }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-4 border-pw-border mb-6">
            {(["global", "alliances", "friends"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3 pixel-font border-r-4 border-pw-border last:border-r-0 ${tab === t ? "bg-pw-gold text-pw-border" : "bg-pw-cream text-pw-navy hover:bg-gray-100"}`}
                style={{ fontSize: 9 }}>
                {t === "global" ? "🌍 GLOBAL" : t === "alliances" ? "🛡️ ALLIANCES" : "👥 FRIENDS"}
              </button>
            ))}
          </div>

          {tab === "global" && (
            <div className="pw-card">
              <div className="divide-y-4 divide-pw-border">
                <div className="grid grid-cols-5 gap-4 px-5 py-2 bg-gray-100">
                  {["Rank", "Player", "Score", "Alliance", ""].map((h) => (
                    <span key={h} className="pixel-font text-gray-500" style={{ fontSize: 7 }}>{h}</span>
                  ))}
                </div>
                {loadingRankings && (
                  <div className="p-8 text-center pixel-font text-gray-500" style={{ fontSize: 8 }}>Loading rankings...</div>
                )}
                {rankings?.map((p: any, i: number) => {
                  const isMe = (p.playerId || p.id) === (player?.playerId || player?.id);
                  const rank = i + 1;
                  const badge = BADGES[i] || "🎖️";
                  
                  return (
                    <div key={p.playerId || p.id || i}
                      className={`grid grid-cols-5 gap-4 px-5 py-4 items-center ${isMe ? "bg-yellow-50 border-l-4 border-pw-gold" : "hover:bg-gray-50"}`}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 16 }}>{badge}</span>
                        <span className="pixel-font text-pw-navy" style={{ fontSize: 10 }}>#{rank}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 border-2 border-pw-border flex items-center justify-center" style={{ backgroundColor: p.color || "#4caf50" }}>
                          <span className="material-symbols-outlined text-white" style={{ fontSize: 12 }}>person</span>
                        </div>
                        <span className={`pixel-font ${isMe ? "text-pw-gold" : "text-pw-navy"}`}
                          style={{ fontSize: 8 }}>
                          {p.username} {isMe && "(You)"}
                        </span>
                      </div>
                      <span className="pixel-font text-pw-gold" style={{ fontSize: 9 }}>{(p.score || 0).toLocaleString()}</span>
                      <span className="pixel-font text-gray-500" style={{ fontSize: 7 }}>{p.allianceId || "—"}</span>
                      <span className="pixel-font flex items-center gap-1 text-gray-400" style={{ fontSize: 8 }}>
                        —
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "alliances" && (
            <div className="pw-card">
              <div className="divide-y-4 divide-pw-border">
                <div className="grid grid-cols-4 gap-4 px-5 py-2 bg-gray-100">
                  {["Rank", "Alliance", "Members", "Territory"].map((h) => (
                    <span key={h} className="pixel-font text-gray-500" style={{ fontSize: 7 }}>{h}</span>
                  ))}
                </div>
                {loadingAlliances && (
                  <div className="p-8 text-center pixel-font text-gray-500" style={{ fontSize: 8 }}>Loading alliances...</div>
                )}
                {sortedAlliances.map((a: any, i: number) => (
                  <div key={a.allianceId} className="grid grid-cols-4 gap-4 px-5 py-4 items-center hover:bg-gray-50">
                    <span className="pixel-font text-pw-navy" style={{ fontSize: 12 }}>#{i + 1}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border-4 border-pw-border pixel-shadow bg-pw-navy flex items-center justify-center">
                        <span className="pixel-font text-white" style={{ fontSize: 6 }}>{a.name.substring(0, 2).toUpperCase()}</span>
                      </div>
                      <span className="pixel-font text-pw-navy" style={{ fontSize: 8 }}>{a.name}</span>
                    </div>
                    <span className="pixel-font" style={{ fontSize: 8 }}>{(a.memberIds || []).length}</span>
                    <span className="pixel-font text-pw-gold" style={{ fontSize: 9 }}>{(a.territory || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "friends" && (
            <div className="pw-card p-12 text-center">
              <span className="material-symbols-outlined text-gray-300" style={{ fontSize: 64 }}>group_add</span>
              <p className="pixel-font text-gray-400 mt-4" style={{ fontSize: 10 }}>
                Add friends to compare rankings
              </p>
              <button className="pixel-btn pixel-btn-gold px-8 py-4 pixel-shadow mt-6" style={{ fontSize: 9 }}>
                INVITE FRIENDS
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
