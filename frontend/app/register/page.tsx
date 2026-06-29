"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, saveToken } from "@/lib/api";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.register(form);
      saveToken(res.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "#0d2b27" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-24 bg-pw-green opacity-10 border-4 border-pw-border" />
        <div className="absolute bottom-10 right-10 w-48 h-32 bg-pw-gold opacity-10 border-4 border-pw-border" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-pw-gold border-4 border-pw-border pixel-shadow mx-auto mb-4">
            <span className="material-symbols-outlined text-pw-border" style={{ fontSize: 40 }}>shield</span>
          </div>
          <h1 className="pixel-font text-pw-gold" style={{ fontSize: 18, textShadow: "4px 4px 0 #000" }}>PIXELWAR</h1>
          <p className="pixel-font text-pw-cream opacity-70 mt-1" style={{ fontSize: 7 }}>JOIN THE SOVEREIGN CANVAS</p>
        </div>

        <div className="pw-card">
          <header className="pw-card-navy-header text-center justify-center">
            ⚔️ CREATE COMMANDER
          </header>
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <div>
              <label className="pixel-font block mb-2 text-pw-navy" style={{ fontSize: 8 }}>COMMANDER NAME</label>
              <input type="text" required value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="CommanderX"
                className="pw-input" />
            </div>
            <div>
              <label className="pixel-font block mb-2 text-pw-navy" style={{ fontSize: 8 }}>EMAIL</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="commander@pixelwar.io"
                className="pw-input" />
            </div>
            <div>
              <label className="pixel-font block mb-2 text-pw-navy" style={{ fontSize: 8 }}>PASSWORD</label>
              <input type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 characters"
                className="pw-input" />
            </div>
            <div className="border-4 border-pw-border p-3 bg-pw-cream">
              <p className="pixel-font text-pw-navy" style={{ fontSize: 7, lineHeight: 1.8 }}>
                By registering you agree to our Terms of Service and Privacy Policy.
                You will start with a small settlement and 500 Gold.
              </p>
            </div>
            {error && (
              <div className="bg-red-900/20 border-2 border-pw-red p-2 text-center">
                <p className="pixel-font text-pw-red" style={{ fontSize: 8 }}>{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="pixel-btn pixel-btn-gold w-full py-4 pixel-shadow disabled:opacity-60"
              style={{ fontSize: 10 }}>
              {loading ? "CREATING KINGDOM..." : "START YOUR EMPIRE"}
            </button>
            <div className="text-center">
              <p className="pixel-font text-gray-500" style={{ fontSize: 7 }}>
                Already have an account?{" "}
                <Link href="/login" className="text-pw-gold hover:underline">LOG IN</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
