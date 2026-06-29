"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

import { useGameStore } from "@/store/gameStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const QUICK_ACTIONS = [
  { label: "CLAIM PIXEL",  icon: "add_location",   href: "/world",    color: "#facc15" },
  { label: "BUILD",        icon: "construction",    href: "/dashboard", color: "#4caf50" },
  { label: "RESEARCH",     icon: "science",         href: "/research", color: "#3b82f6" },
  { label: "TRADE",        icon: "storefront",      href: "/market",   color: "#f97316" },
  { label: "ALLIANCES",    icon: "groups",          href: "/alliances",color: "#a855f7" },
  { label: "MISSIONS",     icon: "assignment",      href: "/missions", color: "#ef4444" },
];

function ResourceBar({ amount, max, color }: { amount: number; max: number; color: string }) {
  const pct = Math.min((amount / max) * 100, 100);
  return (
    <div className="w-full h-3 bg-gray-200 border-2 border-pw-border relative">
      <div className="h-full border-r-2 border-pw-border transition-all duration-500"
        style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { data: player, isLoading } = useQuery({ queryKey: ["player"], queryFn: api.me });
  const { data: myCities } = useQuery({ queryKey: ["myCities"], queryFn: api.myCities });

  const upgradeMutation = useMutation({
    mutationFn: (cityId: string) => api.upgradeCity(cityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCities"] });
      queryClient.invalidateQueries({ queryKey: ["player"] });
      api.myResources().then((resArray) => useGameStore.getState().setResources(resArray));
    },
    onError: (error: any) => {
      alert(error.message || "Failed to upgrade city.");
    }
  });

  const rawResources = useGameStore((s) => s.resources);
  const notifications = useGameStore((s) => s.notifications);

  const resources = [
    { name: "Wood",   icon: "🪵", amount: rawResources.wood || 0, rate: 320,  max: 50000, color: "#8B5E3C" },
    { name: "Stone",  icon: "🪨", amount: rawResources.stone || 0,  rate: 210,  max: 50000, color: "#888" },
    { name: "Iron",   icon: "⛏️", amount: rawResources.iron || 0,  rate: 180,  max: 20000, color: "#607d8b" },
    { name: "Gold",   icon: "🪙", amount: rawResources.gold || 0,  rate: 150,  max: 10000, color: "#facc15" },
    { name: "Food",   icon: "🍞", amount: rawResources.food || 0, rate: 300,  max: 50000, color: "#4caf50" },
    { name: "Energy", icon: "⚡", amount: rawResources.energy || 0,  rate: 250,  max: 30000, color: "#3b82f6" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-56 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 p-6 bg-pw-cream">

          {/* ── Page title ─── */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="pixel-font text-pw-navy" style={{ fontSize: 16 }}>DASHBOARD</h1>
              <p className="pixel-font text-gray-500 mt-1" style={{ fontSize: 8 }}>Commander Overview · Season 12</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border-4 border-pw-border bg-pw-navy px-4 py-2 pixel-shadow">
                <div className="w-2 h-2 rounded-full bg-pw-green animate-pixel-pulse" />
                <span className="pixel-font text-white" style={{ fontSize: 8 }}>18,543 ONLINE</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-6 animate-pulse">
              <div className="h-32 bg-gray-300 border-4 border-pw-border w-full"></div>
              <div className="grid grid-cols-3 gap-6">
                <div className="h-64 bg-gray-300 border-4 border-pw-border"></div>
                <div className="h-64 bg-gray-300 border-4 border-pw-border"></div>
                <div className="h-64 bg-gray-300 border-4 border-pw-border"></div>
              </div>
            </div>
          ) : (
            <>
              {/* ── Kingdom banner ─── */}
          <section className="pw-card mb-6 overflow-hidden">
            <div className="flex items-center gap-0">
              <div className="bg-pw-navy px-6 py-5 border-r-4 border-pw-border flex flex-col items-center gap-2" style={{ minWidth: 160 }}>
                <div className="w-16 h-16 bg-pw-green border-4 border-pw-border pixel-shadow flex items-center justify-center animate-pixel-float">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 36 }}>castle</span>
                </div>
                <span className="pixel-font text-pw-gold" style={{ fontSize: 8 }}>{player?.username || "Guest"}</span>
                <span className="pixel-font text-pw-cream" style={{ fontSize: 7 }}>Lv. {player?.level || 1} Citadel</span>
              </div>
              <div className="flex-1 p-5">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {[
                    { label: "Territory", value: player ? (player.territory || 1) + " px" : "0 px", icon: "map", color: "#4caf50" },
                    { label: "Population", value: player ? (player.population || 100) : 0, icon: "groups", color: "#3b82f6" },
                    { label: "Power", value: player?.score || 0, icon: "bolt", color: "#facc15" },
                    { label: "Defense", value: player ? (player.defense || 50) : 0, icon: "shield", color: "#ef4444" },
                  ].map((s) => (
                    <div key={s.label} className="border-4 border-pw-border p-3 pixel-shadow-sm text-center">
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: s.color }}>{s.icon}</span>
                      <p className="pixel-font text-pw-navy mt-1" style={{ fontSize: 10 }}>{s.value}</p>
                      <p className="pixel-font text-gray-500 mt-1" style={{ fontSize: 7 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="pixel-font text-gray-500" style={{ fontSize: 7 }}>XP Progress to Level {(player?.level || 1) + 1}</span>
                    <span className="pixel-font text-pw-navy" style={{ fontSize: 7 }}>{(player?.score || 0) % 1000} / 1000</span>
                  </div>
                  <div className="pw-progress-track">
                    <div className="pw-progress-fill pw-progress-fill-green" style={{ width: `${((player?.score || 0) % 1000) / 10}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-3 gap-6 mb-6">

            {/* ── Resources ─── */}
            <section className="pw-card col-span-1 flex flex-col">
              <header className="pw-card-header">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>inventory_2</span>
                RESOURCES
                <span className="ml-auto pixel-font text-pw-green" style={{ fontSize: 7 }}>+GROWING</span>
              </header>
              <div className="p-4 flex flex-col gap-3 flex-1">
                {resources.map((r) => (
                  <div key={r.name}>
                    <div className="flex justify-between mb-1">
                      <span className="pixel-font" style={{ fontSize: 8 }}>{r.icon} {r.name}</span>
                      <div className="flex gap-2">
                        <span className="pixel-font text-pw-navy" style={{ fontSize: 8 }}>{r.amount.toLocaleString()}</span>
                        <span className="pixel-font text-pw-green" style={{ fontSize: 7 }}>+{r.rate}/h</span>
                      </div>
                    </div>
                    <ResourceBar amount={r.amount} max={r.max} color={r.color} />
                  </div>
                ))}
              </div>
            </section>

            {/* ── Quick Actions ─── */}
            <section className="pw-card col-span-1 flex flex-col">
              <header className="pw-card-header">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>flash_on</span>
                QUICK ACTIONS
              </header>
              <div className="p-4 grid grid-cols-2 gap-3 flex-1 content-start">
                {QUICK_ACTIONS.map((a) => (
                  <a key={a.label} href={a.href}
                    className="pixel-btn pixel-shadow flex flex-col items-center gap-2 p-4 text-center hover:opacity-90 transition-opacity"
                    style={{ background: a.color, color: "#191c1e", border: "4px solid #191c1e", fontSize: 7 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{a.icon}</span>
                    {a.label}
                  </a>
                ))}
              </div>
            </section>

            {/* ── Notifications ─── */}
            <section className="pw-card col-span-1 flex flex-col">
              <header className="pw-card-header">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>notifications</span>
                NOTIFICATIONS
                <span className="ml-auto w-5 h-5 bg-pw-red border-2 border-pw-border flex items-center justify-center text-white"
                  style={{ fontSize: 8 }}>{notifications.length}</span>
              </header>
              <div className="flex flex-col divide-y-2 divide-gray-200 flex-1 overflow-y-auto">
                {notifications.length === 0 && (
                  <div className="p-4 text-center pixel-font text-gray-500" style={{ fontSize: 8 }}>No notifications</div>
                )}
                {notifications.map((n: any) => (
                  <div key={n.notificationId || n.id}
                    className={`flex items-start gap-3 p-3 ${n.urgent ? "bg-red-50" : ""}`}>
                    <div className={`w-8 h-8 flex-shrink-0 border-2 border-pw-border flex items-center justify-center ${n.urgent ? "bg-pw-red" : "bg-pw-navy"}`}>
                      <span className="material-symbols-outlined text-white" style={{ fontSize: 14 }}>
                        {n.type === "research_completed" ? "science" : "info"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="pixel-font" style={{ fontSize: 7, lineHeight: 1.6 }}>{n.message}</p>
                      <p className="pixel-font text-gray-400 mt-1" style={{ fontSize: 6 }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {n.urgent && <div className="w-2 h-2 bg-pw-red rounded-full animate-pixel-pulse flex-shrink-0 mt-1" />}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── City Management ─── */}
          <section className="pw-card mb-6">
            <header className="pw-card-header">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_city</span>
              YOUR CITIES
            </header>
            <div className="p-4 grid grid-cols-2 gap-4">
              {myCities?.map((c: any) => {
                const upgradeCost = {
                  wood: 100 * (c.level + 1),
                  stone: Math.floor(100 * 0.7) * (c.level + 1),
                  gold: Math.floor(100 * 0.5) * (c.level + 1),
                };
                
                return (
                  <div key={c.cityId} className="flex items-center gap-4 border-4 border-pw-border p-3 bg-white">
                    <div className="w-12 h-12 bg-pw-sky border-4 border-pw-border flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-pw-navy" style={{ fontSize: 24 }}>castle</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="pixel-font text-pw-navy" style={{ fontSize: 9 }}>{c.name}</span>
                        <span className="pixel-font text-pw-gold" style={{ fontSize: 8 }}>Lv. {c.level}</span>
                      </div>
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="pixel-font text-gray-500" style={{ fontSize: 6 }}>COST:</span>
                        <span className="pixel-font text-[#8B5E3C]" style={{ fontSize: 6 }}>{upgradeCost.wood} 🪵</span>
                        <span className="pixel-font text-[#888]" style={{ fontSize: 6 }}>{upgradeCost.stone} 🪨</span>
                        <span className="pixel-font text-pw-gold" style={{ fontSize: 6 }}>{upgradeCost.gold} 🪙</span>
                      </div>
                      <button 
                        onClick={() => upgradeMutation.mutate(c.cityId)}
                        disabled={upgradeMutation.isPending}
                        className="pixel-btn pixel-btn-green w-full mt-2 py-2 pixel-shadow disabled:opacity-50" 
                        style={{ fontSize: 7 }}>
                        {upgradeMutation.isPending ? "UPGRADING..." : "+ UPGRADE CITY"}
                      </button>
                    </div>
                  </div>
                );
              })}
              {!myCities?.length && (
                <div className="border-4 border-dashed border-gray-300 p-4 flex items-center justify-center">
                   <p className="pixel-font text-gray-400" style={{ fontSize: 8 }}>
                     No cities founded yet. Claim land on the map!
                   </p>
                </div>
              )}
            </div>
          </section>
          </>
          )}
        </main>
      </div>
    </div>
  );
}
