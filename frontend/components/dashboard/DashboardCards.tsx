"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Skeleton from "@/components/ui/Skeleton";

export default function DashboardCards() {
  const [player, setPlayer] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [research, setResearch] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.me().then(setPlayer).catch((e) => setError(e.message));
    api.myResources().then(setResources).catch((e) => setError(e.message));
    api.myResearch().then(setResearch).catch(() => setResearch([]));
    api.myMissions().then(setMissions).catch(() => setMissions([]));
  }, []);

  const activeResearch = research.find((r) => r.status === "in_progress");

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <Card title="YOUR KINGDOM">
        {player ? (
          <>
            <p className="font-bold">{player.kingdomName}</p>
            <p className="text-xs text-gray-600">Lv. {player.level}</p>
            <p className="text-xs mt-2">Population: {player.population}</p>
            <p className="text-xs">Power: {player.power}</p>
          </>
        ) : (
          <Skeleton lines={3} />
        )}
      </Card>

      <Card title="RESOURCES">
        {resources.length ? (
          <ul className="text-xs space-y-1">
            {resources.map((r) => (
              <li key={r.resourceType} className="flex justify-between">
                <span className="capitalize">{r.resourceType}</span>
                <span className="text-pw-forest font-bold">
                  {r.amount} <span className="text-gray-400">+{r.ratePerHour}/h</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          error ? <p className="text-xs text-gray-500">Sign in to view resources</p> : <Skeleton lines={4} />
        )}
      </Card>

      <Card title="CURRENT RESEARCH">
        {activeResearch ? (
          <>
            <p className="text-xs">{activeResearch.name}</p>
            <div className="w-full bg-gray-200 rounded h-2 mt-2">
              <div
                className="bg-pw-sky h-2 rounded"
                style={{
                  width: `${Math.min(
                    100,
                    ((Date.now() - activeResearch.startedAt) / (activeResearch.completesAt - activeResearch.startedAt)) * 100
                  )}%`,
                }}
              />
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-500">No active research — visit the Research page to start one.</p>
        )}
      </Card>

      <Card title="ACTIVE MISSIONS">
        {missions.length ? (
          <ul className="text-xs space-y-2">
            {missions.slice(0, 4).map((m) => (
              <li key={m.missionId}>
                {m.label} — {m.progress}/{m.target}
                {m.completed && <span className="text-pw-forest font-bold ml-1">✓</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-500">Sign in to view missions</p>
        )}
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-pw-panel pixel-border p-4">
      <h3 className="pixel-font text-[10px] mb-3 text-pw-forest">{title}</h3>
      {children}
    </div>
  );
}
