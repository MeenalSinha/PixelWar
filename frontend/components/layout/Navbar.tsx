"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, clearToken } from "@/lib/api";

const NAV_ITEMS = [
  { label: "HOME",      href: "/",           icon: "home" },
  { label: "MAP",       href: "/world",       icon: "public" },
  { label: "EMPIRE",    href: "/dashboard",   icon: "fort" },
  { label: "ALLIANCES", href: "/alliances",   icon: "groups" },
  { label: "RANKINGS",  href: "/rankings",    icon: "emoji_events" },
  { label: "SHOP",      href: "/market",      icon: "shopping_cart" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: player } = useQuery({
    queryKey: ["player"],
    queryFn: api.me,
    retry: false,
  });

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 border-b-4 border-pw-border bg-pw-sky"
      style={{ height: 72 }}>

      {/* Nav links with icons */}
      <nav className="flex items-center gap-1 h-full" aria-label="Top navigation">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center gap-1 px-3 h-full pixel-font transition-all duration-100
                ${active
                  ? "text-pw-border border-b-4 border-pw-border bg-white bg-opacity-20"
                  : "text-pw-navy opacity-80 hover:opacity-100 hover:bg-white hover:bg-opacity-20 border-b-4 border-transparent"
                }`}
              style={{ fontSize: 8, minWidth: 56 }}
              aria-current={active ? "page" : undefined}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }} aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Player profile */}
      <div className="flex items-center gap-3 border-4 border-pw-border pixel-shadow bg-pw-sky-dark px-3 py-2 cursor-pointer group" onClick={handleLogout} title="Click to logout">
        <div className="w-9 h-9 bg-pw-navy border-2 border-pw-border overflow-hidden flex items-center justify-center group-hover:bg-pw-red transition-colors">
          <span className="material-symbols-outlined text-pw-gold group-hover:text-white" style={{ fontSize: 20 }}>
            {player ? "person" : "login"}
          </span>
        </div>
        <div className="pixel-font text-pw-border flex flex-col gap-1">
          <span style={{ fontSize: 9 }}>{player ? player.username : "Guest"}</span>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 8 }}>Lv. {player ? player.level : 1}</span>
            {player && <span className="text-pw-gold" style={{ fontSize: 8 }}>🪙 {player.score || 0}</span>}
          </div>
        </div>
      </div>
    </header>
  );
}
