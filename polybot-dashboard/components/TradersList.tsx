"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";

interface Trader {
  address: string;
  totalTrades?: number;
  winRate?: number;
  pnl?: number;
  isActive: boolean;
}

interface TradersListProps {
  traders: Trader[];
}

export default function TradersList({ traders }: TradersListProps) {
  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Tracked Traders
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Monitoring {traders.length} trader{traders.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-3">
        {traders.map((trader, index) => (
          <motion.div
            key={trader.address}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4 hover:bg-white/90 dark:hover:bg-white/[0.06] transition-all duration-200 group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    trader.isActive
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-zinc-500/15 text-zinc-400"
                  }`}
                >
                  {trader.isActive ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-medium truncate">
                      {trader.address.slice(0, 6)}...{trader.address.slice(-4)}
                    </p>
                    {trader.isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground/90">
                    <span>
                      {typeof trader.totalTrades === "number"
                        ? `${trader.totalTrades} trades`
                        : "Trades: —"}
                    </span>
                    <span>•</span>
                    <span>
                      {typeof trader.winRate === "number"
                        ? `${trader.winRate.toFixed(1)}% win rate`
                        : "Win rate: —"}
                    </span>
                    <span>•</span>
                    <span
                      className={
                        typeof trader.pnl === "number" && trader.pnl >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {typeof trader.pnl === "number"
                        ? `${trader.pnl >= 0 ? "+" : ""}$${trader.pnl.toFixed(2)}`
                        : "P&L: —"}
                    </span>
                  </div>
                </div>
              </div>
              <a
                href={`https://polymarket.com/profile/${trader.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-primary/10 rounded-lg"
              >
                <ExternalLink className="w-4 h-4 text-primary" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
