"use client";

import { Activity, TrendingUp, DollarSign, Users } from "lucide-react";
import { motion } from "framer-motion";

interface BotStatusProps {
  isRunning: boolean;
  balance?: number;
  totalTrades?: number;
  profitLoss?: number;
  tradersTracked?: number;
}

export default function BotStatus({
  isRunning,
  balance,
  totalTrades,
  profitLoss,
  tradersTracked,
}: BotStatusProps) {
  const balanceText = typeof balance === "number" ? `$${balance.toFixed(2)}` : "—";
  const totalTradesText = typeof totalTrades === "number" ? totalTrades.toString() : "—";
  const pnlText =
    typeof profitLoss === "number"
      ? `${profitLoss >= 0 ? "+" : ""}$${profitLoss.toFixed(2)}`
      : "—";
  const tradersText = typeof tradersTracked === "number" ? tradersTracked.toString() : "—";

  const stats = [
    {
      label: "Balance",
      value: balanceText,
      icon: DollarSign,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-black/5 dark:bg-white/10",
    },
    {
      label: "Total Trades",
      value: totalTradesText,
      icon: Activity,
      color: "text-zinc-900 dark:text-zinc-100",
      bgColor: "bg-black/5 dark:bg-white/10",
    },
    {
      label: "P&L",
      value: pnlText,
      icon: TrendingUp,
      color:
        typeof profitLoss === "number" && profitLoss >= 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400",
      bgColor: "bg-black/5 dark:bg-white/10",
    },
    {
      label: "Traders",
      value: tradersText,
      icon: Users,
      color: "text-zinc-900 dark:text-zinc-100",
      bgColor: "bg-black/5 dark:bg-white/10",
    },
  ];

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Bot Status</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time monitoring
          </p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            isRunning
              ? "bg-emerald-500/15 text-emerald-500"
              : "bg-rose-500/15 text-rose-500"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isRunning ? "bg-green-500" : "bg-red-500"
            } animate-pulse`}
          />
          <span className="text-sm font-medium">
            {isRunning ? "Active" : "Stopped"}
          </span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4 hover:bg-white/90 dark:hover:bg-white/[0.06] transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`text-xl font-semibold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
