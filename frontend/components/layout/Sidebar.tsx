"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useGameStore } from "@/store/gameStore";

const NAV_ITEMS = [
  { label: "Dashboard",  href: "/dashboard", icon: "home" },
  { label: "World Map",  href: "/world",     icon: "public" },
  { label: "Missions",   href: "/missions",  icon: "assignment" },
  { label: "Research",   href: "/research",  icon: "science" },
  { label: "Market",     href: "/market",    icon: "storefront" },
  { label: "Messages",   href: "/messages",  icon: "mail" },
  { label: "Events",     href: "/events",    icon: "event" },
];

const BOTTOM_ITEMS = [
  { label: "Settings",   href: "/settings",  icon: "settings" },
];

export default function Sidebar({ active }: { active?: string }) {
  const pathname = usePathname();
  const notificationCount = useGameStore((s) => s.notifications.length);

  const { data: player } = useQuery({
    queryKey: ["player"],
    queryFn: api.me,
    retry: false,
  });

  const isActive = (href: string) =>
    active ? active === href.replace("/", "") || active === href :
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-56 flex flex-col z-50 border-r-4 border-pw-border"
      style={{ background: "#4caf50" }}
      aria-label="Main navigation"
    >
      {/* Logo / Brand */}
      <div className="flex flex-col items-center justify-center p-4 border-b-4 border-pw-border bg-pw-navy">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-pw-gold border-2 border-pw-border pixel-shadow-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-pw-border" style={{ fontSize: 16 }}>shield</span>
          </div>
          <div>
            <div className="pixel-font text-pw-gold" style={{ fontSize: 12, lineHeight: 1.2 }}>
              PIXEL<span style={{ color: '#fff' }}>WAR</span>
            </div>
            <div className="pixel-font text-pw-cream" style={{ fontSize: 6, marginTop: 2, letterSpacing: '0.1em' }}>
              SOVEREIGN CANVAS
            </div>
          </div>
        </div>
      </div>

      {/* Player Badge */}
      <div className="flex flex-col items-center py-4 border-b-4 border-pw-border border-opacity-30 bg-[#3d8c40]">
        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-pw-border pixel-shadow bg-pw-sky flex items-center justify-center mb-2 animate-pixel-float">
          <span className="material-symbols-outlined text-pw-navy" style={{ fontSize: 36 }}>
            {player ? "castle" : "person"}
          </span>
        </div>
        <div className="pixel-font text-white text-center" style={{ fontSize: 8 }}>{player ? player.username : "Guest"}</div>
        <div className="pixel-font text-pw-gold mt-1" style={{ fontSize: 7 }}>Lv. {player ? player.level : 1}</div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto" aria-label="Game navigation">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-3 pixel-font transition-all duration-100
                ${active
                  ? "bg-pw-gold text-pw-border border-4 border-pw-border pixel-shadow"
                  : "text-pw-border hover:bg-[#3d8c40] hover:text-white border-4 border-transparent"
                }`}
              style={{ fontSize: 9 }}
              aria-current={active ? "page" : undefined}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, lineHeight: 1 }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.icon === "mail" && notificationCount > 0 && !active && (
                <span className="absolute right-2 top-2 w-5 h-5 bg-pw-red border-2 border-pw-border flex items-center justify-center text-white"
                  style={{ fontSize: 7 }}>
                  {notificationCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom items */}
      <div className="p-2 border-t-4 border-pw-border border-opacity-30">
        {BOTTOM_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            aria-label={item.label}
            className="flex items-center gap-3 px-3 py-3 pixel-font text-pw-border hover:bg-[#3d8c40] hover:text-white border-4 border-transparent transition-all"
            style={{ fontSize: 9 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
