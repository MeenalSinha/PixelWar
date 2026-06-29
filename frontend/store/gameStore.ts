import { create } from "zustand";

export interface ResourceBalance {
  wood: number;
  stone: number;
  iron: number;
  gold: number;
  food: number;
  energy: number;
}

interface GameState {
  player: any | null;
  resources: ResourceBalance;
  notifications: any[];
  setPlayer: (player: any) => void;
  setResources: (resources: any[]) => void;
  updateResourcesFromTick: (tickData: any[]) => void;
  addNotification: (notification: any) => void;
  setNotifications: (notifications: any[]) => void;
}

const initialResources: ResourceBalance = {
  wood: 0,
  stone: 0,
  iron: 0,
  gold: 0,
  food: 0,
  energy: 0,
};

export const useGameStore = create<GameState>((set) => ({
  player: null,
  resources: initialResources,
  notifications: [],

  setPlayer: (player) => set({ player }),

  setResources: (resArray) => {
    const updated = { ...initialResources };
    for (const r of resArray) {
      if (r.resourceType in updated) {
        (updated as any)[r.resourceType] = r.amount;
      }
    }
    set({ resources: updated });
  },

  updateResourcesFromTick: (tickData) => {
    set((state) => {
      const newResources = { ...state.resources };
      for (const update of tickData) {
        if (update.resourceType in newResources) {
          (newResources as any)[update.resourceType] = update.amount;
        }
      }
      return { resources: newResources };
    });
  },

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 10), // keep last 10
    })),

  setNotifications: (notifications) => set({ notifications }),
}));
