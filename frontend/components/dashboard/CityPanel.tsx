"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import Skeleton from "@/components/ui/Skeleton";

export default function CityPanel() {
  const [cities, setCities] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyCityId, setBusyCityId] = useState<string | null>(null);

  async function load() {
    try {
      setCities(await api.myCities());
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpgrade(cityId: string) {
    setBusyCityId(cityId);
    setError(null);
    try {
      await api.upgradeCity(cityId);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusyCityId(null);
    }
  }

  return (
    <div className="bg-pw-panel pixel-border p-4">
      <h3 className="pixel-font text-[10px] mb-3 text-pw-forest">YOUR CITIES</h3>
      {error && <p className="text-xs text-pw-danger mb-2">{error}</p>}
      {cities === null && <Skeleton lines={2} />}
      {cities?.length === 0 && <p className="text-xs text-gray-500">No cities yet — sign in to view your capital.</p>}
      <div className="space-y-2">
        {cities?.map((city) => (
          <motion.div
            key={city.cityId}
            layout
            className="flex justify-between items-center bg-white pixel-border px-3 py-2"
          >
            <div>
              <p className="text-sm font-bold">{city.name}</p>
              <p className="text-xs text-gray-600">Level {city.level} / 10</p>
            </div>
            <button
              onClick={() => handleUpgrade(city.cityId)}
              disabled={busyCityId === city.cityId || city.level >= 10}
              title={city.level >= 10 ? "Max level reached" : "Spend resources to upgrade this city"}
              className="pixel-font text-[8px] bg-pw-forest text-white px-3 py-2 pixel-border disabled:opacity-50"
            >
              {city.level >= 10 ? "MAX" : busyCityId === city.cityId ? "..." : "UPGRADE"}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
