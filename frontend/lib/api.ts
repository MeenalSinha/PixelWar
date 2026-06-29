const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pixelwar_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ? JSON.stringify(body.error) : `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  register: (data: { username: string; email: string; password: string }) =>
    request<{ token: string; player: any }>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; player: any }>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),

  me: () => request<any>("/api/player/me"),

  myResources: () => request<any[]>("/api/player/me/resources"),

  civilizations: () => request<any[]>("/api/player/civilizations"),

  getChunk: (cx: number, cy: number) => request<any>(`/api/world/chunk/${cx}/${cy}`),

  claimPixel: (data: { x: number; y: number; color: string; expectedVersion?: number }) =>
    request<any>("/api/world/pixel/claim", { method: "POST", body: JSON.stringify(data) }),

  attackPixel: (data: { x: number; y: number }) =>
    request<any>("/api/war/attack", { method: "POST", body: JSON.stringify(data) }),

  techTree: () => request<any[]>("/api/research/tree"),
  myResearch: () => request<any[]>("/api/research/me"),
  startResearch: (techId: string) => request<any>("/api/research/start", { method: "POST", body: JSON.stringify({ techId }) }),

  myMissions: () => request<any[]>("/api/missions/me"),

  alliances: () => request<any[]>("/api/alliances"),
  createAlliance: (name: string) => request<any>("/api/alliances", { method: "POST", body: JSON.stringify({ name }) }),
  joinAlliance: (allianceId: string) => request<any>(`/api/alliances/${allianceId}/join`, { method: "POST" }),

  listings: () => request<any[]>("/api/market"),
  createListing: (data: { resourceType: string; quantity: number; pricePerUnit: number }) =>
    request<any>("/api/market", { method: "POST", body: JSON.stringify(data) }),
  buyListing: (listingId: string) => request<any>(`/api/market/${listingId}/buy`, { method: "POST" }),

  chatMessages: (scope: string, allianceId?: string) =>
    request<any[]>(`/api/chat?scope=${scope}${allianceId ? `&allianceId=${allianceId}` : ""}`),
  postChatMessage: (data: { scope: string; allianceId?: string; text: string; username: string }) =>
    request<any>("/api/chat", { method: "POST", body: JSON.stringify(data) }),

  notifications: () => request<any[]>("/api/notifications/me"),

  activateDemoMode: () => request<{ stages: { stage: string; label: string; detail: string }[] }>("/api/demo/activate", { method: "POST" }),

  myCities: () => request<any[]>("/api/cities/me"),
  upgradeCity: (cityId: string) => request<any>(`/api/cities/${cityId}/upgrade`, { method: "POST" }),
  
  rankings: () => request<any[]>("/api/player/rankings"),
};

export function saveToken(token: string) {
  localStorage.setItem("pixelwar_token", token);
}

export function clearToken() {
  localStorage.removeItem("pixelwar_token");
}
