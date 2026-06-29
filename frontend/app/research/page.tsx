"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useGameStore } from "@/store/gameStore";

const AGE_ICONS: Record<string, string> = {
  stone_age: "🪨",
  bronze_age: "🥉",
  iron_age: "⚔️",
  industrial_age: "🏭",
  modern_age: "🏙️",
  digital_age: "💻",
  space_age: "🚀",
};

export default function ResearchPage() {
  const queryClient = useQueryClient();
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Force re-render for countdowns
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { data: techTree } = useQuery({ queryKey: ["techTree"], queryFn: api.techTree });
  const { data: myResearch } = useQuery({ queryKey: ["myResearch"], queryFn: api.myResearch });

  const startMutation = useMutation({
    mutationFn: api.startResearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myResearch"] });
    },
    onError: (err: any) => {
      alert(err.message || "Failed to start research");
    }
  });

  const techs = techTree || [];
  const myResMap = new Map((myResearch || []).map((r: any) => [r.techId, r]));

  // A tech is unlocked if it is the first one, or if the previous one is completed.
  const getStatus = (idx: number, id: string) => {
    const r = myResMap.get(id);
    if (r) return r.status; // "completed" or "in_progress"
    if (idx === 0) return "available";
    const prevId = techs[idx - 1]?.id;
    const prev = myResMap.get(prevId);
    if (prev && prev.status === "completed") return "available";
    return "locked";
  };

  const selectedIdx = techs.findIndex((t: any) => t.id === selectedTechId);
  const selectedTech = selectedIdx !== -1 ? techs[selectedIdx] : null;
  const selectedStatus = selectedTech ? getStatus(selectedIdx, selectedTech.id) : null;
  const selectedResRecord = selectedTech ? myResMap.get(selectedTech.id) : null;

  return (
    <div className="flex min-h-screen">
      <Sidebar active="/research" />
      <div className="flex-1 ml-56 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 p-6 bg-pw-cream">
          <h1 className="pixel-font text-pw-navy mb-6" style={{ fontSize: 14 }}>TECHNOLOGY TREE</h1>

          <div className="grid grid-cols-3 gap-6">
            {/* Tech grid */}
            <div className="col-span-2 grid grid-cols-3 gap-4 auto-rows-max">
              {techs.map((t: any, idx: number) => {
                const status = getStatus(idx, t.id);
                const r = myResMap.get(t.id);
                let progress = 0;
                if (status === "in_progress" && r) {
                  progress = Math.min(100, Math.max(0, ((now - r.startedAt) / (r.completesAt - r.startedAt)) * 100));
                }

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTechId(t.id)}
                    className={`pw-card p-4 text-left transition-all hover:translate-y-[-2px] ${
                      selectedTechId === t.id ? "ring-4 ring-pw-gold" : ""
                    } ${status === "locked" ? "opacity-60 grayscale" : ""}`}
                  >
                    <div className="text-3xl mb-2">{AGE_ICONS[t.id] || "⚙️"}</div>
                    <p className="pixel-font text-pw-navy mb-1" style={{ fontSize: 9 }}>{t.name}</p>
                    
                    {status === "completed" && (
                      <div className="mt-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-pw-green" style={{ fontSize: 14 }}>check_circle</span>
                        <span className="pixel-font text-pw-green" style={{ fontSize: 7 }}>COMPLETE</span>
                      </div>
                    )}
                    {status === "in_progress" && (
                      <div className="mt-3">
                        <div className="pw-progress-track mb-1">
                          <div className="pw-progress-fill pw-progress-fill-blue animate-pixel-pulse" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="pixel-font text-pw-navy" style={{ fontSize: 7 }}>{Math.floor(progress)}%</span>
                      </div>
                    )}
                    {status === "locked" && (
                      <div className="mt-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 14 }}>lock</span>
                        <span className="pixel-font text-gray-400" style={{ fontSize: 7 }}>LOCKED</span>
                      </div>
                    )}
                    {status === "available" && (
                      <div className="mt-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-pw-gold" style={{ fontSize: 14 }}>lightbulb</span>
                        <span className="pixel-font text-pw-gold" style={{ fontSize: 7 }}>AVAILABLE</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tech detail */}
            <div className="col-span-1">
              {selectedTech ? (
                <div className="pw-card">
                  <header className="pw-card-navy-header flex items-center gap-3">
                    <span style={{ fontSize: 20 }}>{AGE_ICONS[selectedTech.id] || "⚙️"}</span>
                    <span style={{ fontSize: 10 }}>{selectedTech.name.toUpperCase()}</span>
                  </header>
                  <div className="p-5 flex flex-col gap-4">
                    <p className="pixel-font text-gray-600" style={{ fontSize: 8, lineHeight: 1.8 }}>
                      Advance your civilization to the {selectedTech.name}.
                    </p>

                    <div>
                      <p className="pixel-font text-pw-navy mb-2" style={{ fontSize: 8 }}>UNLOCKS:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTech.unlocks.map((u: string) => (
                          <span key={u} className="pw-badge pw-badge-green" style={{ fontSize: 7 }}>{u}</span>
                        ))}
                      </div>
                    </div>

                    {selectedStatus === "in_progress" && selectedResRecord && (
                      <div>
                        {(() => {
                          const progress = Math.min(100, Math.max(0, ((now - selectedResRecord.startedAt) / (selectedResRecord.completesAt - selectedResRecord.startedAt)) * 100));
                          const remainingS = Math.max(0, Math.floor((selectedResRecord.completesAt - now) / 1000));
                          const h = String(Math.floor(remainingS / 3600)).padStart(2, '0');
                          const m = String(Math.floor((remainingS % 3600) / 60)).padStart(2, '0');
                          const s = String(remainingS % 60).padStart(2, '0');
                          return (
                            <>
                              <div className="flex justify-between mb-1">
                                <span className="pixel-font" style={{ fontSize: 7 }}>Progress</span>
                                <span className="pixel-font text-pw-navy" style={{ fontSize: 7 }}>{Math.floor(progress)}%</span>
                              </div>
                              <div className="pw-progress-track mb-1">
                                <div className="pw-progress-fill pw-progress-fill-blue" style={{ width: `${progress}%` }} />
                              </div>
                              <p className="pixel-font text-pw-red flex items-center gap-1 mt-2" style={{ fontSize: 7 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>schedule</span>
                                {h}:{m}:{s} remaining
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {selectedStatus === "available" && (
                      <button 
                        onClick={() => startMutation.mutate(selectedTech.id)}
                        disabled={startMutation.isPending}
                        className="pixel-btn pixel-btn-gold w-full py-3 pixel-shadow disabled:opacity-50" 
                        style={{ fontSize: 9 }}>
                        {startMutation.isPending ? "STARTING..." : "START RESEARCH"}
                      </button>
                    )}
                    
                    {selectedStatus === "completed" && (
                      <div className="flex items-center justify-center gap-2 py-3 border-4 border-pw-green bg-green-50">
                        <span className="material-symbols-outlined text-pw-green" style={{ fontSize: 20 }}>check_circle</span>
                        <span className="pixel-font text-pw-green" style={{ fontSize: 9 }}>RESEARCHED</span>
                      </div>
                    )}

                    {selectedStatus === "locked" && (
                      <div className="flex items-center justify-center gap-2 py-3 border-4 border-gray-400 bg-gray-100">
                        <span className="material-symbols-outlined text-gray-500" style={{ fontSize: 20 }}>lock</span>
                        <span className="pixel-font text-gray-500" style={{ fontSize: 9 }}>LOCKED</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pw-card p-8 text-center">
                  <span className="material-symbols-outlined text-gray-300" style={{ fontSize: 48 }}>science</span>
                  <p className="pixel-font text-gray-400 mt-4" style={{ fontSize: 9 }}>Select a technology</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
