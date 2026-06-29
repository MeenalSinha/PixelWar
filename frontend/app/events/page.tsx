"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { useRealtime } from "@/lib/useRealtime";

export default function EventsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({ 
    queryKey: ["notifications"], 
    queryFn: api.notifications,
  });

  useRealtime((event) => {
    // Assuming notifications might be pushed via websocket, or we can just invalidate on global events
    if (event.type === "NOTIFICATION" || event.type === "GLOBAL_EVENT") {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar active="/events" />
      <div className="flex-1 ml-56 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 p-6 bg-pw-cream flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h1 className="pixel-font text-pw-navy" style={{ fontSize: 14 }}>WORLD EVENTS & NOTIFICATIONS</h1>
          </div>

          <div className="flex-1 pw-card flex flex-col" style={{ minHeight: 600 }}>
            <header className="pw-card-navy-header">🔔 LATEST EVENTS</header>
            
            <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
              {isLoading && (
                <div className="text-center text-gray-400 pixel-font mt-10" style={{ fontSize: 8 }}>Loading events...</div>
              )}
              {!isLoading && (!notifications || notifications.length === 0) && (
                <div className="text-center text-gray-400 pixel-font mt-10" style={{ fontSize: 8 }}>The world is quiet. No recent events.</div>
              )}
              {notifications?.map((notif: any) => {
                // Determine icon and color based on notification type if available
                let icon = "info";
                let colorClass = "bg-pw-sky";
                let iconColor = "text-pw-navy";
                
                const lowerText = (notif.message || notif.text || "").toLowerCase();
                if (lowerText.includes("attack") || lowerText.includes("conquered") || lowerText.includes("destroyed")) {
                  icon = "swords";
                  colorClass = "bg-pw-red";
                  iconColor = "text-white";
                } else if (lowerText.includes("alliance")) {
                  icon = "handshake";
                  colorClass = "bg-pw-gold";
                  iconColor = "text-pw-navy";
                } else if (lowerText.includes("research") || lowerText.includes("unlocked")) {
                  icon = "science";
                  colorClass = "bg-[#4caf50]";
                  iconColor = "text-white";
                }

                return (
                  <div key={notif.notificationId || notif.id} className="flex gap-4 items-center animate-slide-right border-2 border-pw-border p-3 bg-white hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 flex-shrink-0 border-2 border-pw-border flex items-center justify-center pixel-shadow-sm ${colorClass}`}>
                      <span className={`material-symbols-outlined ${iconColor}`} style={{ fontSize: 18 }}>{icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="pixel-font text-pw-navy" style={{ fontSize: 8 }}>{notif.type || "SYSTEM UPDATE"}</span>
                        <span className="pixel-font text-gray-400" style={{ fontSize: 6 }}>
                          {new Date(notif.timestamp || notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="pixel-font text-gray-700" style={{ fontSize: 7, lineHeight: 1.6 }}>{notif.message || notif.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
