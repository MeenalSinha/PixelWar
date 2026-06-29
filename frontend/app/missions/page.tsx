"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const MISSION_ICONS: Record<string, string> = {
  capture_500_pixels: "🌍",
  build_level_10_city: "🏰",
  win_3_battles: "⚔️",
  create_alliance: "🤝",
  research_space_age: "🚀",
};

export default function MissionsPage() {
  const { data: missions, isLoading } = useQuery({ queryKey: ["missions"], queryFn: api.myMissions });

  const doneCount = missions?.filter((m: any) => m.completed).length || 0;
  const totalCount = missions?.length || 0;
  const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar active="/missions" />
      <div className="flex-1 ml-56 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 p-6 bg-pw-cream">
          <div className="flex items-center justify-between mb-6">
            <h1 className="pixel-font text-pw-navy" style={{ fontSize: 14 }}>MISSIONS</h1>
          </div>

          {/* Progress summary */}
          <div className="pw-card p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="pixel-font text-pw-navy" style={{ fontSize: 9 }}>OVERALL PROGRESS</span>
              <span className="pixel-font" style={{ fontSize: 9, color: "#facc15" }}>{doneCount}/{totalCount}</span>
            </div>
            <div className="pw-progress-track">
              <div className="pw-progress-fill" style={{ width: `${progressPercent}%`, background: "#facc15" }} />
            </div>
          </div>

          {/* Mission list */}
          <div className="grid grid-cols-2 gap-4">
            {isLoading && (
              <div className="col-span-2 p-8 text-center pixel-font text-gray-500" style={{ fontSize: 8 }}>Loading missions...</div>
            )}
            {missions?.map((m: any) => (
              <article key={m.missionId}
                className={`pw-card flex flex-col ${m.completed ? "opacity-80" : ""}`}>
                <div className="flex items-start gap-4 p-4">
                  <div className={`w-12 h-12 flex-shrink-0 border-4 border-pw-border pixel-shadow flex items-center justify-center text-2xl ${
                    m.completed ? "bg-pw-green" : "bg-pw-cream"
                  }`}>
                    {m.completed ? "✅" : (MISSION_ICONS[m.missionId] || "🎯")}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`pixel-font ${m.completed ? "line-through text-gray-400" : "text-pw-navy"}`}
                        style={{ fontSize: 9 }}>{m.label}</p>
                      {m.completed && (
                        <span className="pw-badge pw-badge-green flex-shrink-0" style={{ fontSize: 6 }}>DONE</span>
                      )}
                    </div>

                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <span className="pixel-font text-gray-500" style={{ fontSize: 7 }}>Progress</span>
                        <span className="pixel-font" style={{ fontSize: 7 }}>{m.progress} / {m.target}</span>
                      </div>
                      <div className="pw-progress-track">
                        <div
                          className={`pw-progress-fill ${m.completed ? "pw-progress-fill-green" : "pw-progress-fill-blue"}`}
                          style={{ width: `${Math.min((m.progress / m.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
