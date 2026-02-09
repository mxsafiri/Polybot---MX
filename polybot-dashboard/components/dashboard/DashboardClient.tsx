"use client";

import { useEffect, useMemo, useState } from "react";
import BotStatus from "@/components/BotStatus";
import TradesFeed from "@/components/TradesFeed";
import TradersList from "@/components/TradersList";
import { Activity, Bot, LayoutGrid, Settings } from "lucide-react";

type StatusResponse = {
  ok: boolean;
  bot: {
    isRunning: boolean;
    lastSeenAt: number | null;
    previewMode: boolean | null;
  };
  tracking: {
    tradersTracked: number;
    tradeCount24h: number;
  };
  config: {
    proxyWallet: string;
  };
};

type TradesResponse = {
  ok: boolean;
  trades: Array<{
    id: string;
    timestamp: number | null;
    trader: string;
    action: "BUY" | "SELL";
    amountUsd: number | null;
    price: number | null;
    market: string | null;
    txHash: string | null;
    isBot: boolean;
  }>;
};

type PositionsResponse = {
  ok: boolean;
  positionsByTrader: Array<{
    trader: string;
    totalValue: number;
    overallPnl: number;
  }>;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
}

function shortAddr(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function toEpochMs(value: number) {
  return value < 1_000_000_000_000 ? value * 1000 : value;
}

export default function DashboardClient() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [trades, setTrades] = useState<TradesResponse | null>(null);
  const [positions, setPositions] = useState<PositionsResponse | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const tick = async () => {
      try {
        const [s, t, p] = await Promise.all([
          fetchJson<StatusResponse>("/api/status"),
          fetchJson<TradesResponse>("/api/trades?limit=50"),
          fetchJson<PositionsResponse>("/api/positions"),
        ]);

        if (!isMounted) return;
        setStatus(s);
        setTrades(t);
        setPositions(p);
        setHasError(false);
      } catch {
        if (!isMounted) return;
        setHasError(true);
      }
    };

    tick();
    const timer = setInterval(tick, 5000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const tradersList = useMemo(() => {
    if (!positions?.ok) return [];
    return positions.positionsByTrader.map((t) => ({
      address: t.trader,
      pnl: t.totalValue * t.overallPnl,
      isActive: true,
    }));
  }, [positions]);

  const tradesFeed = useMemo(() => {
    if (!trades?.ok) return [];
    return trades.trades
      .filter((t) => Boolean(t.timestamp))
      .map((t) => ({
        id: t.id,
        timestamp: toEpochMs(t.timestamp ?? Date.now()),
        trader: t.trader,
        action: t.action,
        amount: typeof t.amountUsd === "number" ? t.amountUsd : undefined,
        price: typeof t.price === "number" ? t.price : undefined,
        market: t.market ?? "(unknown market)",
        txHash: t.txHash ?? "",
      }));
  }, [trades]);

  const isRunning = status?.ok ? status.bot.isRunning : false;

  return (
    <div className="min-h-screen bg-zinc-50 text-foreground dark:bg-black">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-[length:64px_64px] opacity-50 dark:opacity-15 pointer-events-none" />

      <div className="relative flex">
        <aside className="hidden md:flex w-72 flex-col gap-6 p-6">
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">Polybot</div>
              <div className="text-xs text-muted-foreground truncate">
                {status?.ok ? shortAddr(status.config.proxyWallet) : "Connecting…"}
              </div>
            </div>
          </div>

          <nav className="glass-card p-2">
            <a className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-white/90 dark:hover:bg-white/[0.06]" href="#">
              <LayoutGrid className="h-4 w-4" /> Dashboard
            </a>
            <a className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-white/90 dark:hover:bg-white/[0.06]" href="#">
              <Activity className="h-4 w-4" /> Bot
            </a>
            <a className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-white/90 dark:hover:bg-white/[0.06]" href="#">
              <Settings className="h-4 w-4" /> Settings
            </a>
          </nav>

          {hasError && (
            <div className="glass-card p-4 text-sm text-rose-500">
              Unable to load live data. Check dashboard env + Mongo connectivity.
            </div>
          )}
        </aside>

        <main className="flex-1 p-6">
          <header className="glass-card p-5 flex items-center justify-between">
            <div>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight">
                Bot Dashboard
              </h1>
              <p className="text-xs text-muted-foreground/90 mt-1">
                Live data only • {status?.ok ? `${status.tracking.tradersTracked} traders` : "connecting"}
              </p>
            </div>
            <div className="text-xs text-muted-foreground/90">
              {status?.ok && status.bot.previewMode !== null
                ? `Preview: ${status.bot.previewMode ? "ON" : "OFF"}`
                : "Preview: —"}
            </div>
          </header>

          <div className="mt-6 space-y-6">
            <BotStatus
              isRunning={isRunning}
              totalTrades={status?.ok ? status.tracking.tradeCount24h : undefined}
              tradersTracked={status?.ok ? status.tracking.tradersTracked : undefined}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TradesFeed trades={tradesFeed} />
              </div>
              <div>
                <TradersList traders={tradersList} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
