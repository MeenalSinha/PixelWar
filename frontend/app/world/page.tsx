"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import PixelCanvas from "@/components/world/PixelCanvas";
import Minimap from "@/components/world/Minimap";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

function useCountdown(initial: number) {
  const [s, setS] = useState(initial);
  useEffect(() => { const id = setInterval(() => setS((v) => Math.max(v - 1, 0)), 1000); return () => clearInterval(id); }, []);
  const h = String(Math.floor(s / 3600)).padStart(2,"0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2,"0");
  const sec = String(s % 60).padStart(2,"0");
  return `${h}:${m}:${sec}`;
}

export default function WorldPage() {
  const [chunk, setChunk] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<"claim" | "attack">("claim");
  const [heatmap, setHeatmap] = useState<string | null>(null);
  const countdown = useCountdown(2 * 3600 + 15 * 60 + 47);

  const { data: rankings } = useQuery({ queryKey: ["rankings"], queryFn: api.rankings });
  const topEmpires = (rankings || []).slice(0, 5).map((r, i) => ({
    rank: i + 1,
    name: r.username,
    score: (r.score || 0).toLocaleString(),
    color: r.color || "#4caf50",
  }));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      const map: Record<string, () => void> = {
        ArrowUp: ()    => setChunk((c) => ({ ...c, y: c.y - 1 })),
        w:       ()    => setChunk((c) => ({ ...c, y: c.y - 1 })),
        ArrowDown: ()  => setChunk((c) => ({ ...c, y: c.y + 1 })),
        s:       ()    => setChunk((c) => ({ ...c, y: c.y + 1 })),
        ArrowLeft: ()  => setChunk((c) => ({ ...c, x: c.x - 1 })),
        a:       ()    => setChunk((c) => ({ ...c, x: c.x - 1 })),
        ArrowRight: () => setChunk((c) => ({ ...c, x: c.x + 1 })),
        d:       ()    => setChunk((c) => ({ ...c, x: c.x + 1 })),
      };
      map[e.key]?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-56 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 flex" style={{ height: "calc(100vh - 72px)" }}>

          {/* Canvas area */}
          <div className="flex-1 relative flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center gap-4 px-4 py-3 border-b-4 border-pw-border bg-pw-navy">
              <span className="pixel-font text-pw-gold" style={{ fontSize: 10 }}>WORLD MAP</span>
              <span className="pixel-font text-gray-400" style={{ fontSize: 8 }}>
                Chunk ({chunk.x}, {chunk.y}) · WASD to pan
              </span>
              <div className="ml-auto flex items-center gap-3">
                <button
                  onClick={() => setMode("claim")}
                  className={`pixel-btn px-3 py-2 pixel-shadow ${mode === "claim" ? "pixel-btn-gold" : "pixel-btn-navy"}`}
                  style={{ fontSize: 8 }}>
                  ✏️ CLAIM
                </button>
                <button
                  onClick={() => setMode("attack")}
                  className={`pixel-btn px-3 py-2 pixel-shadow ${mode === "attack" ? "pixel-btn-red" : "pixel-btn-navy"}`}
                  style={{ fontSize: 8 }}>
                  ⚔️ ATTACK
                </button>
                <div className="flex gap-1">
                  {[
                    { label: "←", action: () => setChunk((c) => ({ ...c, x: c.x - 1 })) },
                    { label: "↑", action: () => setChunk((c) => ({ ...c, y: c.y - 1 })) },
                    { label: "↓", action: () => setChunk((c) => ({ ...c, y: c.y + 1 })) },
                    { label: "→", action: () => setChunk((c) => ({ ...c, x: c.x + 1 })) },
                  ].map((btn) => (
                    <button key={btn.label} onClick={btn.action}
                      className="pixel-btn pixel-btn-navy px-2 py-1 pixel-shadow"
                      style={{ fontSize: 10 }}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto p-6 bg-[#1e4e79] flex items-start gap-6">
              <div className="flex flex-col gap-4">
                <PixelCanvas chunkX={chunk.x} chunkY={chunk.y} />
                <Minimap currentChunk={chunk} onSelectChunk={setChunk} />
              </div>
            </div>
          </div>

          {/* Right panel */}
          <aside className="w-72 border-l-4 border-pw-border flex flex-col bg-pw-cream overflow-y-auto">
            {/* Top Empires */}
            <div style={{ background: "#0d2b27" }}>
              <div className="border-b-4 border-[#14533c] px-4 py-3">
                <span className="pixel-font text-pw-gold" style={{ fontSize: 9 }}>🏆 TOP EMPIRES</span>
              </div>
              <ul className="p-4 flex flex-col gap-3">
                {topEmpires.length === 0 && (
                  <li className="text-gray-400 text-xs pixel-font">No players yet.</li>
                )}
                {topEmpires.map((e) => (
                  <li key={e.rank} className="flex items-center gap-3">
                    <span className="pixel-font" style={{ fontSize: 8, color: e.color, minWidth: 16 }}>{e.rank}</span>
                    <div className="w-4 h-4 border-2 border-pw-border" style={{ background: e.color }} />
                    <span className="pixel-font text-white flex-1" style={{ fontSize: 8 }}>{e.name}</span>
                    <span className="pixel-font text-pw-gold" style={{ fontSize: 8 }}>{e.score}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Global Event */}
            <div className="border-t-4 border-pw-border p-4" style={{ background: "#2e1045" }}>
              <p className="pixel-font text-pw-gold mb-3" style={{ fontSize: 9 }}>⚡ GLOBAL EVENT</p>
              <p className="pixel-font text-pw-gold mb-1" style={{ fontSize: 9 }}>METEOR SHOWER</p>
              <p className="pixel-font text-white mb-3" style={{ fontSize: 7, lineHeight: 1.6 }}>
                A meteor shower is falling across the world!
              </p>
              <div className="text-center border-4 border-pw-border bg-pw-navy py-2">
                <span className="pixel-font text-pw-red animate-pixel-blink" style={{ fontSize: 18 }}>{countdown}</span>
              </div>
            </div>

            {/* Heatmap options */}
            <div className="border-t-4 border-pw-border p-4 bg-pw-cream">
              <p className="pixel-font text-pw-navy mb-3" style={{ fontSize: 9 }}>HEATMAP OVERLAY</p>
              <div className="flex flex-wrap gap-2">
                {["Population", "Battles", "Trade", "Resources"].map((h) => (
                  <button key={h} 
                    onClick={() => setHeatmap(heatmap === h ? null : h)}
                    className={`pixel-btn px-3 py-2 pixel-shadow ${ heatmap === h ? "pixel-btn-gold" : "pixel-btn-navy" }`} 
                    style={{ fontSize: 7 }}>
                    {h}
                  </button>
                ))}
              </div>
              {heatmap && <p className="pixel-font text-pw-gold mt-2" style={{ fontSize: 6 }}>Showing: {heatmap} overlay</p>}
            </div>

            {/* Legend */}
            <div className="border-t-4 border-pw-border p-4 bg-pw-cream">
              <p className="pixel-font text-pw-navy mb-3" style={{ fontSize: 9 }}>BIOME LEGEND</p>
              <div className="flex flex-col gap-2">
                {[
                  { name: "Forest",  color: "#1f7a3f" },
                  { name: "Desert",  color: "#e3c16f" },
                  { name: "Ocean",   color: "#2f6fa8" },
                  { name: "Plains",  color: "#a8c969" },
                  { name: "Mountain",color: "#7d7d7d" },
                ].map((b) => (
                  <div key={b.name} className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-pw-border" style={{ background: b.color }} />
                    <span className="pixel-font" style={{ fontSize: 7 }}>{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
