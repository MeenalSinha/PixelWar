"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useGameStore } from "@/store/gameStore";

const RESOURCE_ICONS: Record<string, string> = {
  wood: "🪵",
  stone: "🪨",
  iron: "⛏️",
  gold: "🪙",
  food: "🍞",
  energy: "⚡"
};

export default function MarketPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  
  const [sellRes, setSellRes] = useState("wood");
  const [sellQty, setSellQty] = useState(100);
  const [sellPrice, setSellPrice] = useState(10);
  const [status, setStatus] = useState("");

  const { data: listings, isLoading } = useQuery({ queryKey: ["listings"], queryFn: api.listings });
  const { data: player } = useQuery({ queryKey: ["player"], queryFn: api.me });
  const resources = useGameStore((s) => s.resources);

  const buyMutation = useMutation({
    mutationFn: api.buyListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["player"] });
      setStatus("Purchase successful!");
      setTimeout(() => setStatus(""), 3000);
    },
    onError: (err: any) => {
      setStatus(err.message || "Failed to buy");
      setTimeout(() => setStatus(""), 3000);
    }
  });

  const sellMutation = useMutation({
    mutationFn: api.createListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      setTab("buy");
      setStatus("Listing created!");
      setTimeout(() => setStatus(""), 3000);
    },
    onError: (err: any) => {
      setStatus(err.message || "Failed to create listing");
      setTimeout(() => setStatus(""), 3000);
    }
  });

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    sellMutation.mutate({ resourceType: sellRes, quantity: sellQty, pricePerUnit: sellPrice });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar active="/market" />
      <div className="flex-1 ml-56 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 p-6 bg-pw-cream">
          <div className="flex items-center justify-between mb-6">
            <h1 className="pixel-font text-pw-navy" style={{ fontSize: 14 }}>MARKETPLACE</h1>
            <div className="flex items-center gap-2 border-4 border-pw-border bg-pw-navy px-4 py-2 pixel-shadow">
              <span className="text-pw-gold" style={{ fontSize: 14 }}>🪙</span>
              <span className="pixel-font text-pw-gold" style={{ fontSize: 10 }}>{(player?.score || 0).toLocaleString()} Gold</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-4 border-pw-border mb-6">
            {(["buy", "sell"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3 pixel-font border-r-4 border-pw-border last:border-r-0 ${
                  tab === t ? "bg-pw-gold text-pw-border" : "bg-pw-cream text-pw-navy hover:bg-gray-100"
                }`} style={{ fontSize: 9 }}>
                {t === "buy" ? "BUY RESOURCES" : "SELL RESOURCES"}
              </button>
            ))}
          </div>

          {status && (
            <div className="mb-4 p-3 bg-pw-navy border-4 border-pw-border text-pw-cream pixel-font text-center" style={{ fontSize: 8 }}>
              {status}
            </div>
          )}

          {tab === "buy" && (
            <div className="pw-card">
              <header className="pw-card-navy-header">🛒 OPEN LISTINGS</header>
              <div className="divide-y-4 divide-pw-border">
                <div className="grid grid-cols-5 gap-4 px-5 py-2 bg-gray-100">
                  {["Resource", "Quantity", "Price/Unit", "Total", "Action"].map((h) => (
                    <span key={h} className="pixel-font text-gray-500" style={{ fontSize: 7 }}>{h}</span>
                  ))}
                </div>
                {isLoading && (
                  <div className="p-8 text-center pixel-font text-gray-500" style={{ fontSize: 8 }}>Loading market...</div>
                )}
                {(!listings || listings.length === 0) && !isLoading && (
                  <div className="p-8 text-center pixel-font text-gray-500" style={{ fontSize: 8 }}>No open listings right now.</div>
                )}
                {listings?.map((l: any) => (
                  <div key={l.id || l.listingId} className="grid grid-cols-5 gap-4 px-5 py-4 items-center hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 16 }}>{RESOURCE_ICONS[l.resourceType] || "📦"}</span>
                      <span className="pixel-font" style={{ fontSize: 8 }}>{l.resourceType}</span>
                    </div>
                    <span className="pixel-font text-pw-navy" style={{ fontSize: 8 }}>{l.quantity.toLocaleString()}</span>
                    <span className="pixel-font text-gray-600" style={{ fontSize: 8 }}>{l.pricePerUnit}g</span>
                    <span className="pixel-font text-pw-gold" style={{ fontSize: 9 }}>{(l.quantity * l.pricePerUnit).toLocaleString()}g</span>
                    <div>
                      {l.sellerId === (player?.playerId || player?.id) ? (
                        <span className="pw-badge pw-badge-navy" style={{ fontSize: 7 }}>YOURS</span>
                      ) : (
                        <button 
                          onClick={() => buyMutation.mutate(l.id || l.listingId)}
                          disabled={buyMutation.isPending}
                          className="pixel-btn pixel-btn-gold px-3 py-2 pixel-shadow disabled:opacity-50" style={{ fontSize: 7 }}>
                          {buyMutation.isPending ? "..." : "BUY"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "sell" && (
            <div className="pw-card max-w-lg mx-auto flex flex-col">
              <header className="pw-card-header">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>shopping_bag</span>
                CREATE LISTING
              </header>
              <form onSubmit={handleCreateListing} className="p-6 flex flex-col gap-6">
                <div>
                  <label className="pixel-font text-pw-navy block mb-3" style={{ fontSize: 8 }}>RESOURCE</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["wood", "stone", "iron", "food", "energy"].map((r) => (
                      <button key={r} type="button" onClick={() => setSellRes(r)}
                        className={`pixel-btn py-2 border-2 ${sellRes === r ? "bg-pw-navy text-white border-pw-navy" : "bg-white text-pw-navy border-gray-300"}`}
                        style={{ fontSize: 7 }}>
                        {RESOURCE_ICONS[r]} {r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <p className="pixel-font text-gray-500 mt-2 text-right" style={{ fontSize: 6 }}>
                    You have: {(resources as any)[sellRes]?.toLocaleString() || 0}
                  </p>
                </div>

                <div>
                  <label className="pixel-font text-pw-navy block mb-2" style={{ fontSize: 8 }}>QUANTITY</label>
                  <input type="number" required min={1} value={sellQty} onChange={(e) => setSellQty(Number(e.target.value))} className="pw-input w-full" />
                </div>

                <div>
                  <label className="pixel-font text-pw-navy block mb-2" style={{ fontSize: 8 }}>PRICE PER UNIT (GOLD)</label>
                  <input type="number" required min={0.1} step={0.1} value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} className="pw-input w-full" />
                </div>

                <div className="border-4 border-pw-border p-4 text-center bg-gray-50">
                  <p className="pixel-font text-gray-500 mb-1" style={{ fontSize: 7 }}>YOU WILL RECEIVE</p>
                  <p className="pixel-font text-pw-gold" style={{ fontSize: 16 }}>{(sellQty * sellPrice).toLocaleString()}g</p>
                </div>

                <button type="submit" disabled={sellMutation.isPending} className="pixel-btn pixel-btn-green w-full py-4 pixel-shadow disabled:opacity-50" style={{ fontSize: 9 }}>
                  {sellMutation.isPending ? "CREATING..." : "CREATE LISTING"}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
