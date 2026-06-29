"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useRealtime } from "@/lib/useRealtime";
import { useQueryClient } from "@tanstack/react-query";

const CHUNK_PX = 32;
const CELL_SIZE = 16;

const BIOME_COLORS: Record<string, string> = {
  forest: "#1f7a3f", desert: "#e3c16f", ocean: "#2f6fa8", mountain: "#7d7d7d",
  snow: "#e8f0f5", swamp: "#4a5a3a", plains: "#a8c969", volcano: "#8a3324", river: "#5fa8c9",
};

export default function PixelCanvas({ chunkX = 0, chunkY = 0 }: { chunkX?: number; chunkY?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pixels, setPixels] = useState<Record<string, any>>({});
  const [selectedColor, setSelectedColor] = useState("#F4C430");
  const [mode, setMode] = useState<"claim" | "attack">("claim");
  const [status, setStatus] = useState<string | null>(null);
  const [feed, setFeed] = useState<string[]>([]);
  const [flash, setFlash] = useState<{ id: number; dx: number; dy: number } | null>(null);
  const queryClient = useQueryClient();

  async function loadChunk() {
    try {
      const { pixels: items } = await api.getChunk(chunkX, chunkY);
      const map: Record<string, any> = {};
      for (const p of items) map[`${p.x}_${p.y}`] = p;
      setPixels(map);
    } catch (e) {
      // Chunk may be empty/unclaimed entirely — that's a valid state, not an error.
    }
  }

  useEffect(() => {
    loadChunk();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chunkX, chunkY]);

  useRealtime((event) => {
    if (event.type === "PIXEL_CLAIMED") {
      const p = event.pixel;
      setPixels((prev) => ({ ...prev, [`${p.x}_${p.y}`]: p }));
    }
    if (event.type === "PIXEL_ATTACKED") {
      const b = (event as any).battle;
      setPixels((prev) => ({
        ...prev,
        [`${b.x}_${b.y}`]: { ...(prev[`${b.x}_${b.y}`] || {}), health: b.newHealth, owner: b.captured ? null : prev[`${b.x}_${b.y}`]?.owner },
      }));
      setFeed((f) => [`Battle at (${b.x}, ${b.y}): ${b.damage} damage${b.captured ? " — CAPTURED" : ""}`, ...f].slice(0, 5));
    }
    if (event.type === "GLOBAL_EVENT") {
      const ev = (event as any).event;
      setFeed((f) => [`Global event: ${ev.label} affected ${ev.affectedCount} kingdoms`, ...f].slice(0, 5));
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let dx = 0; dx < CHUNK_PX; dx++) {
      for (let dy = 0; dy < CHUNK_PX; dy++) {
        const x = chunkX * CHUNK_PX + dx;
        const y = chunkY * CHUNK_PX + dy;
        const p = pixels[`${x}_${y}`];
        ctx.fillStyle = p?.owner ? p.color : BIOME_COLORS[p?.biome] || "#d8e8d4";
        ctx.fillRect(dx * CELL_SIZE, dy * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
      }
    }
  }, [pixels, chunkX, chunkY]);

  async function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const dx = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const dy = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    const x = chunkX * CHUNK_PX + dx;
    const y = chunkY * CHUNK_PX + dy;
    const existing = pixels[`${x}_${y}`];

    if (mode === "attack") {
      try {
        setStatus(`Attacking (${x}, ${y})...`);
        const battle = await api.attackPixel({ x, y });
        setStatus(`Dealt ${battle.damage} damage${battle.captured ? " — captured!" : ""}`);
      } catch (err: any) {
        setStatus(err.message);
      }
      return;
    }

    try {
      setStatus(`Claiming pixel (${x}, ${y})...`);
      
      // Optimistic Update
      const prevPixel = pixels[`${x}_${y}`];
      setPixels((prev) => ({ 
        ...prev, 
        [`${x}_${y}`]: { ...prevPixel, x, y, color: selectedColor, owner: "optimistic_pending" } 
      }));
      setFlash({ id: Date.now(), dx, dy });

      const claimed = await api.claimPixel({ x, y, color: selectedColor, expectedVersion: existing?.version });
      setPixels((prev) => ({ ...prev, [`${x}_${y}`]: claimed }));
      setStatus(`Claimed (${x}, ${y})`);
      
      // Invalidate the 'player' query to fetch the updated territory count
      queryClient.invalidateQueries({ queryKey: ["player"] });
    } catch (err: any) {
      // Revert Optimistic Update
      setPixels((prev) => ({ ...prev, [`${x}_${y}`]: existing }));
      setStatus(err.message?.includes("401") || err.message?.includes("Missing") ? "Sign in to claim pixels" : err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <button
          onClick={() => setMode("claim")}
          className={`pixel-font text-[9px] px-3 py-2 pixel-border ${mode === "claim" ? "bg-pw-gold text-pw-navy" : "bg-white"}`}
        >
          CLAIM MODE
        </button>
        <button
          onClick={() => setMode("attack")}
          className={`pixel-font text-[9px] px-3 py-2 pixel-border ${mode === "attack" ? "bg-pw-danger text-white" : "bg-white"}`}
        >
          ATTACK MODE
        </button>
        {mode === "claim" && (
          <>
            <span className="pixel-font text-[10px]">COLOR:</span>
            <input type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-8 h-8 pixel-border" />
          </>
        )}
        {status && <span className="text-xs text-gray-600">{status}</span>}
      </div>
      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          width={CHUNK_PX * CELL_SIZE}
          height={CHUNK_PX * CELL_SIZE}
          onClick={handleClick}
          role="img"
          aria-label={`Pixel world chunk ${chunkX}, ${chunkY}. Use the canvas to claim or attack pixels with a mouse; keyboard-only access is on the roadmap.`}
          className={`pixel-border ${mode === "attack" ? "cursor-crosshair" : "cursor-pointer"}`}
        />
        <AnimatePresence>
          {flash && (
            <motion.div
              key={flash.id}
              initial={{ opacity: 0.9, scale: 0.5 }}
              animate={{ opacity: 0, scale: 2.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onAnimationComplete={() => setFlash(null)}
              className="absolute rounded-full bg-pw-gold pointer-events-none"
              style={{
                width: CELL_SIZE * 2,
                height: CELL_SIZE * 2,
                left: flash.dx * CELL_SIZE - CELL_SIZE / 2,
                top: flash.dy * CELL_SIZE - CELL_SIZE / 2,
              }}
            />
          )}
        </AnimatePresence>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Viewing chunk ({chunkX}, {chunkY}) — {CHUNK_PX}x{CHUNK_PX} pixels. {mode === "claim" ? "Click to claim a pixel." : "Click an enemy pixel to attack it."}
      </p>
      <p className="sr-only" role="status" aria-live="polite">{status}</p>
      {feed.length > 0 && (
        <div className="mt-3 bg-pw-navy text-white text-xs pixel-border p-3 max-w-md" role="log" aria-live="polite">
          {feed.map((line, i) => <p key={i} className="py-1 border-b border-white/10 last:border-0">{line}</p>)}
        </div>
      )}
    </div>
  );
}
