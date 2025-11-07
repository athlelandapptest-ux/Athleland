"use client";

import { useEffect, useState } from "react";

type Counter = { total: number; used: number; remaining: number };

export default function ClassCounter() {
  const [data, setData] = useState<Counter | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/class-counter", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (e: any) {
      setErr(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const mutate = async (action: "checkin" | "undo") => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/class-counter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (e: any) {
      setErr(e?.message ?? "Error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading class counter…</div>;
  if (err) return <div className="text-red-500 text-sm">Error: {err}</div>;
  if (!data) return null;

  const pct = data.total ? Math.round((data.used / data.total) * 100) : 0;

  return (
    <div className="rounded-2xl border bg-card p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Class Counter</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-muted">{pct}%</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-2xl font-bold">{data.total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{data.used}</div>
          <div className="text-xs text-muted-foreground">Used</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{data.remaining}</div>
          <div className="text-xs text-muted-foreground">Remaining</div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => mutate("checkin")}
          disabled={busy || data.used >= data.total}
          className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-40"
        >
          Check-in
        </button>
        <button
          onClick={() => mutate("undo")}
          disabled={busy || data.used <= 0}
          className="px-3 py-2 rounded-xl border"
        >
          Undo
        </button>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Atomic updates with RLS. Survives refresh and works on mobile/web.
      </p>
    </div>
  );
}
