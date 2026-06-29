"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    api.notifications().then(setNotifications).catch(() => setNotifications([]));
  }, []);

  return (
    <div className="bg-pw-panel pixel-border p-4">
      <h3 className="pixel-font text-[10px] mb-3 text-pw-forest">NOTIFICATIONS</h3>
      {notifications.length === 0 && <p className="text-xs text-gray-500">No notifications yet.</p>}
      <ul className="text-xs space-y-2 max-h-56 overflow-y-auto">
        {notifications.map((n) => (
          <li key={n.notificationId} className={n.read ? "text-gray-500" : "font-bold"}>
            {n.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
