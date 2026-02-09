"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Trade {
  id: string;
  timestamp: number;
  trader: string;
  action: "BUY" | "SELL";
  amount?: number;
  price?: number;
  market: string;
  txHash: string;
}

interface TradesFeedProps {
  trades: Trade[];
}

export default function TradesFeed({ trades }: TradesFeedProps) {
  return (
    <div className="glass-card p-6 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Live Trades</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time trade execution
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          {trades.length} trades
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        <AnimatePresence mode="popLayout">
          {trades.map((trade, index) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-4 hover:bg-white/90 dark:hover:bg-white/[0.06] transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      trade.action === "BUY"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {trade.action === "BUY" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-sm font-semibold ${
                          trade.action === "BUY"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {trade.action}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(trade.timestamp, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">
                      {trade.market}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/90">
                      <span>
                        Trader: {trade.trader.slice(0, 6)}...
                        {trade.trader.slice(-4)}
                      </span>
                      <span>•</span>
                      <span>
                        {typeof trade.amount === "number"
                          ? `$${trade.amount.toFixed(2)}`
                          : "$—"}
                      </span>
                      <span>•</span>
                      <span>
                        {typeof trade.price === "number"
                          ? `@$${trade.price.toFixed(2)}`
                          : "@$—"}
                      </span>
                    </div>
                  </div>
                </div>
                <a
                  href={`https://polygonscan.com/tx/${trade.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-primary/10 rounded-lg"
                >
                  <ExternalLink className="w-4 h-4 text-primary" />
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {trades.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">Waiting for trades...</p>
          </div>
        )}
      </div>
    </div>
  );
}
