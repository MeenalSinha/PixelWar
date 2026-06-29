"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { api, clearToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("pw_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setAudioEnabled(parsed.audio ?? true);
      setNotificationsEnabled(parsed.notifications ?? true);
    }
  }, []);

  const saveSetting = (key: string, value: boolean) => {
    const saved = localStorage.getItem("pw_settings");
    const current = saved ? JSON.parse(saved) : {};
    localStorage.setItem("pw_settings", JSON.stringify({ ...current, [key]: value }));
  };

  const { data: player } = useQuery({ 
    queryKey: ["player"], 
    queryFn: api.me 
  });

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar active="/settings" />
      <div className="flex-1 ml-56 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 p-6 bg-pw-cream flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h1 className="pixel-font text-pw-navy" style={{ fontSize: 14 }}>SETTINGS</h1>
          </div>

          <div className="max-w-2xl">
            <div className="pw-card mb-6">
              <header className="pw-card-navy-header">⚙️ GAME PREFERENCES</header>
              <div className="p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="pixel-font text-pw-navy" style={{ fontSize: 9 }}>Audio</h3>
                    <p className="pixel-font text-gray-500 mt-1" style={{ fontSize: 7 }}>Enable game sounds and music</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" 
                      checked={audioEnabled} 
                      onChange={(e) => { setAudioEnabled(e.target.checked); saveSetting("audio", e.target.checked); }} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none border-2 border-pw-border peer-checked:bg-[#4caf50]"></div>
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white border-2 border-pw-border transition-all peer-checked:translate-x-5"></span>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="pixel-font text-pw-navy" style={{ fontSize: 9 }}>Notifications</h3>
                    <p className="pixel-font text-gray-500 mt-1" style={{ fontSize: 7 }}>Show in-game alerts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" 
                      checked={notificationsEnabled} 
                      onChange={(e) => { setNotificationsEnabled(e.target.checked); saveSetting("notifications", e.target.checked); }} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none border-2 border-pw-border peer-checked:bg-[#4caf50]"></div>
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white border-2 border-pw-border transition-all peer-checked:translate-x-5"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pw-card">
              <header className="pw-card-header text-pw-red">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
                DANGER ZONE
              </header>
              <div className="p-6">
                <p className="pixel-font text-gray-600 mb-4" style={{ fontSize: 7, lineHeight: 1.6 }}>
                  You are currently logged in as <strong className="text-pw-navy">{player?.username || "Guest"}</strong>.
                  Logging out will require you to enter your credentials again.
                </p>
                <button 
                  onClick={handleLogout}
                  className="pixel-btn pixel-btn-red px-6 py-3 pixel-shadow" 
                  style={{ fontSize: 8 }}
                >
                  LOGOUT
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
