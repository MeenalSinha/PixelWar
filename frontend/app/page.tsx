"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

// ─── Mock data (replaces API calls while backend wires up) ─────────────────
const MOCK_STATS = {
  livePlayers:   18543,
  pixelsClaimed: "6.42B",
  alliances:     312,
  citiesBuilt:   24891,
  warsActive:    47,
};

const MOCK_EMPIRES = [
  { rank: 1, name: "Emerald Empire",    score: "68.2M", color: "#4caf50" },
  { rank: 2, name: "Crimson Order",     score: "55.6M", color: "#ef4444" },
  { rank: 3, name: "Golden Dynasty",    score: "48.1M", color: "#facc15" },
  { rank: 4, name: "Northern Alliance", score: "36.7M", color: "#60a5fa" },
  { rank: 5, name: "Shadow Rebellion",  score: "29.3M", color: "#a855f7" },
];

const MOCK_NEWS = [
  { id: 1, color: "#4caf50", empire: "Emerald Empire",   msg: "captured a mega city!",                           time: "5m ago" },
  { id: 2, color: "#ef4444", empire: "Crimson Order",    msg: "declared war on Northern Alliance",               time: "12m ago" },
  { id: 3, color: "#a855f7", empire: "Shadow Rebellion", msg: "formed an alliance with Sea Titans",              time: "18m ago" },
  { id: 4, color: "#3b82f6", empire: "The Great Market", msg: "prices have changed!",                            time: "25m ago" },
];

// ─── Countdown hook ───────────────────────────────────────────────────────
function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// ─── Animated counter ────────────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number | string }) {
  const [displayed, setDisplayed] = useState(0);
  const target = typeof value === "number" ? value : 0;
  useEffect(() => {
    if (typeof value !== "number") return;
    let start = 0;
    const step = Math.ceil(target / 40);
    const id = setInterval(() => {
      start = Math.min(start + step, target);
      setDisplayed(start);
      if (start >= target) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [target, value]);
  if (typeof value === "string") return <>{value}</>;
  return <>{displayed.toLocaleString()}</>;
}

// ─── Main Page ───────────────────────────────────────────────────────────
export default function HomePage() {
  const countdown = useCountdown(2 * 3600 + 15 * 60 + 47);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        <Navbar />
        <main id="main-content" className="flex-1 flex flex-col">

          {/* ── HERO ─────────────────────────────────────────────────────────── */}
          <section
            className="relative flex flex-col items-center justify-center text-center overflow-hidden border-b-4 border-pw-border"
            style={{ minHeight: 260, background: "#87ceeb" }}
            aria-label="Hero banner"
          >
            {/* Cloud decorations */}
            <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
              <div className="absolute top-6 left-12 bg-white pixel-border opacity-80" style={{ width: 80, height: 30 }} />
              <div className="absolute top-10 left-24 bg-white pixel-border opacity-60" style={{ width: 120, height: 30 }} />
              <div className="absolute top-4 right-32 bg-white pixel-border opacity-80" style={{ width: 100, height: 30 }} />
              <div className="absolute top-8 right-16 bg-white pixel-border opacity-60" style={{ width: 70, height: 28 }} />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-pw-green border-t-4 border-pw-border border-dashed opacity-70" />
            </div>

            <div className="relative z-10 py-8 px-4">
              <p className="pixel-font text-pw-navy mb-3 tracking-widest" style={{ fontSize: 11 }}>
                BUILD. DEFEND. CONQUER.
              </p>
              <h1
                className="pixel-font uppercase mb-3"
                style={{
                  fontSize: "clamp(40px, 7vw, 72px)",
                  color: "#facc15",
                  WebkitTextStroke: "3px #191c1e",
                  textShadow: "4px 4px 0 #191c1e",
                  lineHeight: 1.1,
                }}
              >
                PIXELWAR
              </h1>
              <p className="pixel-font text-pw-navy mb-6 tracking-widest" style={{ fontSize: 10 }}>
                ONE WORLD. INFINITE LEGENDS.
              </p>
              <Link
                href="/world"
                className="pixel-btn pixel-btn-gold px-8 py-4 pixel-shadow animate-glow"
                style={{ fontSize: 13 }}
                aria-label="Enter the PixelWar world"
              >
                ENTER THE WORLD
              </Link>
            </div>
          </section>

          {/* ── STATS BAR ────────────────────────────────────────────────────── */}
          <section
            className="border-b-4 border-pw-border"
            style={{ background: "#0d2b27" }}
            aria-label="Live game statistics"
          >
            <div className="grid grid-cols-5">
              {[
                { label: "LIVE PLAYERS",   value: MOCK_STATS.livePlayers,   icon: "groups",        color: "#4caf50" },
                { label: "PIXELS CLAIMED", value: MOCK_STATS.pixelsClaimed, icon: "public",        color: "#4caf50" },
                { label: "ALLIANCES",      value: MOCK_STATS.alliances,     icon: "shield",        color: "#4caf50" },
                { label: "CITIES BUILT",   value: MOCK_STATS.citiesBuilt,   icon: "location_city", color: "#4caf50" },
                { label: "WARS ACTIVE",    value: MOCK_STATS.warsActive,    icon: "swords",        color: "#ef4444" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`flex items-center gap-3 p-4 ${i < 4 ? "border-r-4 border-[#14533c]" : ""}`}
                  aria-label={`${stat.label}: ${stat.value}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: stat.color }}>
                    {stat.icon}
                  </span>
                  <div>
                    <p className="pixel-font" style={{ fontSize: 7, color: stat.color, marginBottom: 4 }}>
                      {stat.label}
                    </p>
                    <p className="pixel-font text-white" style={{ fontSize: 14 }}>
                      <AnimatedNumber value={stat.value} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── MAP + PANELS ─────────────────────────────────────────────────── */}
          <section className="flex border-b-4 border-pw-border" style={{ height: 380 }} aria-label="World map overview">
            {/* Map area */}
            <div
              className="flex-1 relative overflow-hidden border-r-4 border-pw-border"
              style={{ background: "#1e4e79" }}
            >
              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
                aria-hidden
              />
              {/* Territory blobs */}
              <svg className="absolute inset-0 w-full h-full opacity-70" aria-hidden>
                <ellipse cx="30%" cy="40%" rx="18%" ry="14%" fill="#4caf50" opacity="0.8"/>
                <ellipse cx="55%" cy="35%" rx="14%" ry="12%" fill="#ef4444" opacity="0.8"/>
                <ellipse cx="70%" cy="55%" rx="12%" ry="10%" fill="#facc15" opacity="0.8"/>
                <ellipse cx="20%" cy="65%" rx="10%" ry="8%"  fill="#60a5fa" opacity="0.8"/>
                <ellipse cx="45%" cy="60%" rx="16%" ry="11%" fill="#a855f7" opacity="0.8"/>
                <ellipse cx="80%" cy="30%" rx="8%"  ry="7%"  fill="#f97316" opacity="0.8"/>
              </svg>
              {/* Map labels */}
              {[
                { x: "28%", y: "38%", label: "Verdantia" },
                { x: "52%", y: "32%", label: "Crimson Wastes" },
                { x: "68%", y: "52%", label: "Gold Fields" },
              ].map((l) => (
                <div key={l.label} className="absolute pixel-font text-white"
                  style={{ left: l.x, top: l.y, fontSize: 7, textShadow: "1px 1px 0 #000" }}>
                  {l.label}
                </div>
              ))}
              {/* Map controls */}
              <div className="absolute left-4 top-4 flex flex-col gap-2 z-10" aria-label="Map controls">
                {["+", "−", "⊕", "≡"].map((icon) => (
                  <button key={icon}
                    className="w-10 h-10 bg-pw-navy border-4 border-pw-border pixel-shadow-sm text-white pixel-font flex items-center justify-center hover:bg-[#14533c] transition-colors"
                    style={{ fontSize: 12 }}>
                    {icon}
                  </button>
                ))}
              </div>
              {/* Live indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-pw-navy bg-opacity-80 border-2 border-pw-border px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-pw-green animate-pixel-pulse" />
                <span className="pixel-font text-white" style={{ fontSize: 8 }}>LIVE</span>
              </div>
              <Link href="/world"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 pixel-btn pixel-btn-gold px-6 py-2 pixel-shadow"
                style={{ fontSize: 9 }}>
                OPEN FULL MAP
              </Link>
            </div>

            {/* Right panels */}
            <div className="w-72 flex flex-col bg-pw-cream">
              {/* Top Empires */}
              <div className="flex-1 flex flex-col border-b-4 border-pw-border" style={{ background: "#0d2b27" }}>
                <div className="border-b-4 border-[#14533c] px-4 py-3 flex justify-between items-center">
                  <span className="pixel-font text-pw-gold" style={{ fontSize: 9 }}>TOP EMPIRES</span>
                  <span className="material-symbols-outlined text-pw-gold" style={{ fontSize: 16 }}>emoji_events</span>
                </div>
                <ul className="flex flex-col gap-2 p-4 flex-1">
                  {MOCK_EMPIRES.map((e) => (
                    <li key={e.rank} className="flex items-center gap-3">
                      <span className="pixel-font" style={{ fontSize: 8, color: e.color, minWidth: 16 }}>{e.rank}</span>
                      <div className="w-4 h-4 border-2 border-pw-border" style={{ background: e.color }} />
                      <span className="pixel-font text-white flex-1" style={{ fontSize: 8 }}>{e.name}</span>
                      <span className="pixel-font text-pw-gold" style={{ fontSize: 8 }}>{e.score}</span>
                    </li>
                  ))}
                </ul>
                <div className="p-3">
                  <Link href="/rankings"
                    className="block w-full py-2 text-center pixel-btn pixel-shadow"
                    style={{ fontSize: 8, background: "#2db87d", color: "white", border: "2px solid #191c1e" }}>
                    VIEW FULL RANKINGS
                  </Link>
                </div>
              </div>

              {/* Global Event */}
              <div className="p-4" style={{ background: "#2e1045" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pw-gold animate-pixel-pulse" style={{ fontSize: 20 }}>
                    local_fire_department
                  </span>
                  <span className="pixel-font text-pw-gold" style={{ fontSize: 9 }}>GLOBAL EVENT</span>
                </div>
                <p className="pixel-font text-pw-gold mb-1" style={{ fontSize: 9 }}>METEOR SHOWER</p>
                <p className="pixel-font text-white mb-3" style={{ fontSize: 7, lineHeight: 1.6 }}>
                  A meteor shower is falling across the world!
                </p>
                <div className="text-center border-4 border-pw-border bg-pw-navy py-2">
                  <span className="pixel-font text-pw-red animate-pixel-blink" style={{ fontSize: 18 }}>
                    {countdown}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── 4 CARDS ──────────────────────────────────────────────────────── */}
          <section className="grid grid-cols-4 gap-0 border-b-4 border-pw-border bg-pw-cream" aria-label="Game status panels">

            {/* Kingdom */}
            <article className="pw-card border-r-4 flex flex-col">
              <header className="pw-card-header">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>fort</span>
                YOUR KINGDOM
              </header>
              <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pw-green border-4 border-pw-border pixel-shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 24 }}>castle</span>
                  </div>
                  <div>
                    <p className="pixel-font" style={{ fontSize: 10, color: "#0d2b27" }}>Verdantia</p>
                    <p className="pixel-font text-gray-500" style={{ fontSize: 7, marginTop: 2 }}>Lv. 42 Citadel</p>
                  </div>
                </div>
                <div>
                  <div className="pw-progress-track">
                    <div className="pw-progress-fill pw-progress-fill-green" style={{ width: "60%" }} />
                  </div>
                  <p className="pixel-font text-gray-500 mt-1" style={{ fontSize: 7 }}>12,450 / 20,000 XP</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Territory", value: "12.4M" },
                    { label: "Population", value: "8,932" },
                    { label: "Power", value: "68.2K" },
                  ].map((s) => (
                    <div key={s.label} className="border-2 border-pw-border p-1">
                      <p className="pixel-font text-gray-500" style={{ fontSize: 6 }}>{s.label}</p>
                      <p className="pixel-font text-pw-navy" style={{ fontSize: 8, marginTop: 2 }}>{s.value}</p>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard"
                  className="mt-auto pixel-btn pixel-btn-green w-full py-3 pixel-shadow"
                  style={{ fontSize: 8 }}>
                  MANAGE KINGDOM
                </Link>
              </div>
            </article>

            {/* Resources */}
            <article className="pw-card border-r-4 flex flex-col">
              <header className="pw-card-header">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>database</span>
                RESOURCES
              </header>
              <div className="p-4 flex-1 flex flex-col gap-2">
                {[
                  { emoji: "🪵", name: "Wood",   amount: "12.4K", rate: "+320/h" },
                  { emoji: "🪨", name: "Stone",  amount: "8.7K",  rate: "+210/h" },
                  { emoji: "⛏️", name: "Iron",   amount: "6.3K",  rate: "+180/h" },
                  { emoji: "🪙", name: "Gold",   amount: "4.8K",  rate: "+150/h" },
                  { emoji: "🍞", name: "Food",   amount: "11.2K", rate: "+300/h" },
                  { emoji: "⚡", name: "Energy", amount: "9.6K",  rate: "+250/h" },
                ].map((r) => (
                  <div key={r.name} className="flex items-center justify-between border-b border-dashed border-gray-200 pb-1">
                    <span className="pixel-font" style={{ fontSize: 8 }}>{r.emoji} {r.name}</span>
                    <span className="pixel-font text-pw-navy" style={{ fontSize: 8 }}>{r.amount}</span>
                    <span className="pixel-font text-pw-green" style={{ fontSize: 7 }}>{r.rate}</span>
                  </div>
                ))}
                <Link href="/market"
                  className="mt-auto pixel-btn pixel-btn-green w-full py-3 pixel-shadow"
                  style={{ fontSize: 8 }}>
                  GO TO MARKET
                </Link>
              </div>
            </article>

            {/* Research */}
            <article className="pw-card border-r-4 flex flex-col">
              <header className="pw-card-header">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>science</span>
                CURRENT RESEARCH
              </header>
              <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 border-4 border-pw-border bg-gray-200 flex items-center justify-center">
                    <span className="material-symbols-outlined text-pw-navy" style={{ fontSize: 24 }}>precision_manufacturing</span>
                  </div>
                  <div>
                    <p className="pixel-font text-pw-navy" style={{ fontSize: 9 }}>Industrial Age</p>
                    <p className="pixel-font text-gray-500" style={{ fontSize: 7, marginTop: 2 }}>Lv. 3</p>
                  </div>
                </div>
                <div>
                  <div className="pw-progress-track">
                    <div className="pw-progress-fill pw-progress-fill-blue" style={{ width: "45%" }} />
                  </div>
                  <p className="pixel-font text-gray-500 mt-1" style={{ fontSize: 7 }}>45% complete</p>
                </div>
                <div>
                  <p className="pixel-font text-gray-500 mb-2" style={{ fontSize: 7 }}>Unlocks:</p>
                  <div className="flex gap-2 text-lg">⚙️ 🏭 🚂</div>
                </div>
                <div className="flex items-center gap-2 text-pw-red">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                  <span className="pixel-font" style={{ fontSize: 8 }}>01:45:30</span>
                </div>
                <Link href="/research"
                  className="mt-auto pixel-btn pixel-btn-green w-full py-3 pixel-shadow"
                  style={{ fontSize: 8 }}>
                  VIEW RESEARCH
                </Link>
              </div>
            </article>

            {/* Missions */}
            <article className="pw-card flex flex-col">
              <header className="pw-card-header">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>assignment</span>
                ACTIVE MISSIONS
              </header>
              <div className="p-4 flex-1 flex flex-col gap-3">
                {[
                  { icon: "⚔️",  label: "Capture 500 Pixels",      current: 276, total: 500 },
                  { icon: "🏰",  label: "Build Level 10 City",      current: 0,   total: 1 },
                  { icon: "🏆",  label: "Win 3 Battles",            current: 2,   total: 3 },
                  { icon: "🔬",  label: "Research Industrial Age",  current: 1,   total: 1 },
                ].map((m) => (
                  <div key={m.label} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="pixel-font" style={{ fontSize: 7 }}>{m.icon} {m.label}</span>
                      <span className={`pixel-font ${m.current === m.total ? "text-pw-green" : "text-gray-500"}`}
                        style={{ fontSize: 7 }}>
                        {m.current}/{m.total}
                      </span>
                    </div>
                    <div className="pw-progress-track">
                      <div
                        className={`pw-progress-fill ${m.current === m.total ? "pw-progress-fill-green" : ""}`}
                        style={{ width: `${(m.current / m.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <Link href="/missions"
                  className="mt-auto pixel-btn pixel-btn-green w-full py-3 pixel-shadow"
                  style={{ fontSize: 8 }}>
                  VIEW ALL MISSIONS
                </Link>
              </div>
            </article>
          </section>

          {/* ── WORLD NEWS FEED ───────────────────────────────────────────────── */}
          <section className="border-b-4 border-pw-border" aria-label="World news feed">
            <div className="bg-pw-navy border-b-4 border-[#14533c] flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-pw-gold animate-pixel-pulse" style={{ fontSize: 18 }}>
                  newspaper
                </span>
                <span className="pixel-font text-pw-gold" style={{ fontSize: 9 }}>WORLD NEWS FEED</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-pw-gold" />
                  <div className="w-2 h-2 bg-pw-gold animate-pixel-blink" />
                </div>
              </div>
              <Link href="/rankings"
                className="pixel-btn pixel-btn-gold px-4 py-2 pixel-shadow"
                style={{ fontSize: 7 }}>
                VIEW ALL NEWS
              </Link>
            </div>
            <div className="grid grid-cols-4 bg-pw-cream">
              {MOCK_NEWS.map((n, i) => (
                <div key={n.id}
                  className={`flex gap-3 p-4 items-start ${i < 3 ? "border-r-4 border-pw-border" : ""}`}>
                  <div className="w-10 h-10 flex-shrink-0 border-4 border-pw-border pixel-shadow-sm"
                    style={{ background: n.color }} />
                  <div>
                    <p className="pixel-font" style={{ fontSize: 7, lineHeight: 1.6 }}>
                      <strong>{n.empire}</strong> {n.msg}
                    </p>
                    <p className="pixel-font text-gray-400 mt-1" style={{ fontSize: 6 }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CREATE YOUR LEGACY ───────────────────────────────────────────── */}
          <section
            className="relative flex flex-col items-center justify-center text-center py-16 overflow-hidden border-b-4 border-pw-border"
            style={{ background: "#87ceeb", minHeight: 240 }}
            aria-label="Create your legacy"
          >
            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-pw-green border-t-4 border-pw-border border-dashed" aria-hidden />
            {/* Knight placeholder */}
            <div className="absolute bottom-16 left-16 w-28 h-36 bg-gray-300 border-4 border-pw-border pixel-shadow flex items-center justify-center" aria-label="Knight character">
              <span className="material-symbols-outlined text-pw-navy" style={{ fontSize: 48 }}>person</span>
            </div>
            {/* Archer placeholder */}
            <div className="absolute bottom-16 right-16 w-28 h-36 bg-gray-300 border-4 border-pw-border pixel-shadow flex items-center justify-center" aria-label="Archer character">
              <span className="material-symbols-outlined text-pw-navy" style={{ fontSize: 48 }}>sports_handball</span>
            </div>
            <div className="relative z-10">
              <h2 className="pixel-font uppercase mb-3"
                style={{ fontSize: "clamp(22px, 4vw, 36px)", color: "white", WebkitTextStroke: "2px #191c1e", textShadow: "4px 4px 0 #191c1e" }}>
                CREATE YOUR LEGACY
              </h2>
              <p className="pixel-font text-pw-navy mb-6" style={{ fontSize: 9, lineHeight: 1.8 }}>
                BUILD YOUR EMPIRE, FIGHT FOR GLORY,<br />AND WRITE YOUR NAME IN HISTORY!
              </p>
              <Link href="/world"
                className="pixel-btn pixel-btn-gold px-10 py-4 pixel-shadow animate-glow"
                style={{ fontSize: 13 }}>
                PLAY NOW
              </Link>
            </div>
          </section>

          {/* ── WHY PLAY ─────────────────────────────────────────────────────── */}
          <section className="py-12 px-8 bg-pw-cream border-b-4 border-pw-border" aria-label="Why play PixelWar">
            <h2 className="pixel-font text-center text-pw-navy mb-10" style={{ fontSize: 14 }}>
              WHY PLAY PIXELWAR?
            </h2>
            <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { icon: "public",        color: "#3b82f6", title: "MASSIVE PERSISTENT WORLD",
                  desc: "A world that never resets. Your actions shape history forever." },
                { icon: "swords",        color: "#facc15", title: "REAL-TIME BATTLES",
                  desc: "Every move, every attack, every pixel happens in real time." },
                { icon: "location_city", color: "#4caf50", title: "BUILD & INNOVATE",
                  desc: "From small villages to mighty civilizations. You decide." },
              ].map((f) => (
                <div key={f.title} className="flex gap-4 items-start">
                  <div className="w-16 h-16 border-4 border-pw-border pixel-shadow flex-shrink-0 flex items-center justify-center"
                    style={{ background: f.color }}>
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 32 }}>{f.icon}</span>
                  </div>
                  <div>
                    <h3 className="pixel-font text-pw-navy mb-2" style={{ fontSize: 9 }}>{f.title}</h3>
                    <p className="pixel-font text-gray-600" style={{ fontSize: 7, lineHeight: 1.8 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── JOIN THE BATTLE ───────────────────────────────────────────────── */}
          <section
            className="py-16 px-8 text-center border-b-4 border-pw-border"
            style={{ background: "#4472c4" }}
            aria-label="Pre-registration"
          >
            <h2 className="pixel-font text-white mb-4"
              style={{ fontSize: "clamp(18px, 3vw, 28px)", textShadow: "4px 4px 0 #191c1e" }}>
              JOIN THE BATTLE!
            </h2>
            <p className="pixel-font text-white mb-8 opacity-90" style={{ fontSize: 9 }}>
              BE PART OF THE BIGGEST PIXEL STRATEGY GAME EVER.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
              onSubmit={(e) => { e.preventDefault(); alert("You're on the list! 🎮"); }}
              aria-label="Pre-registration form"
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="pw-input flex-1"
                aria-label="Email address"
              />
              <button type="submit"
                className="pixel-btn pixel-btn-gold px-8 py-4 pixel-shadow whitespace-nowrap"
                style={{ fontSize: 10 }}>
                PRE-REGISTER
              </button>
            </form>
            <p className="pixel-font text-white mt-4 opacity-70" style={{ fontSize: 7 }}>
              Be the first to know when the world opens.
            </p>
          </section>

          {/* ── FOOTER ────────────────────────────────────────────────────────── */}
          <footer className="bg-pw-yellow border-t-4 border-pw-border px-8 py-10" aria-label="Site footer">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 max-w-6xl mx-auto">
              {/* Brand */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pw-sky border-4 border-pw-border pixel-shadow flex items-center justify-center">
                  <span className="material-symbols-outlined text-pw-navy" style={{ fontSize: 24 }}>shield</span>
                </div>
                <div>
                  <div className="pixel-font text-pw-navy" style={{ fontSize: 14 }}>PIXELWAR</div>
                  <div className="pixel-font text-pw-navy opacity-70" style={{ fontSize: 7, marginTop: 2 }}>SOVEREIGN CANVAS</div>
                </div>
              </div>

              {/* Footer links */}
              <div className="grid grid-cols-4 gap-10">
                {[
                  { title: "GAME", links: ["How to Play", "Guides", "FAQ"] },
                  { title: "COMMUNITY", links: ["Discord", "Forum", "News"] },
                  { title: "COMPANY", links: ["About Us", "Careers", "Contact"] },
                  { title: "LEGAL", links: ["Privacy Policy", "Terms of Service"] },
                ].map((col) => (
                  <div key={col.title}>
                    <p className="pixel-font text-pw-navy mb-3" style={{ fontSize: 8 }}>{col.title}</p>
                    <ul className="flex flex-col gap-2">
                      {col.links.map((l) => (
                        <li key={l}>
                          <a href="#" className="pixel-font text-pw-navy opacity-70 hover:opacity-100 hover:underline"
                            style={{ fontSize: 7 }}>{l}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-8 pixel-font text-pw-navy opacity-60" style={{ fontSize: 6 }}>
              © 2024 PixelWar: Sovereign Canvas. All rights reserved.
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}
