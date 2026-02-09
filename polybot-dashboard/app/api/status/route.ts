import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/server/mongo";
import { getServerEnv } from "@/lib/server/env";

export const runtime = "nodejs";

function getCollectionName(prefix: string, address: string) {
  return `${prefix}_${address.toLowerCase()}`;
}

export async function GET() {
  const serverEnv = getServerEnv();
  await connectMongo();

  const db = (await connectMongo()).connection.db;
  if (!db) {
    return NextResponse.json(
      { ok: false, error: "MongoDB not connected" },
      { status: 500 }
    );
  }

  const now = Date.now();
  const botStatus = await db
    .collection("bot_status")
    .findOne<{ lastSeenAt?: number; previewMode?: boolean }>(
      { _id: "singleton" } as unknown as Record<string, unknown>
    );

  const userAddresses = serverEnv.USER_ADDRESSES.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((a) => a.toLowerCase());

  // Recent trade count across all tracked traders (last 24h)
  const since = now - 24 * 60 * 60 * 1000;
  const counts = await Promise.all(
    userAddresses.map(async (address) => {
      const collection = getCollectionName("user_activities", address);
      const count = await db
        .collection(collection)
        .countDocuments({ type: "TRADE", timestamp: { $gte: since } });
      return count;
    })
  );

  return NextResponse.json({
    ok: true,
    bot: {
      isRunning: Boolean(botStatus?.lastSeenAt && now - botStatus.lastSeenAt < 30_000),
      lastSeenAt: botStatus?.lastSeenAt ?? null,
      previewMode: botStatus?.previewMode ?? null,
    },
    tracking: {
      tradersTracked: userAddresses.length,
      tradeCount24h: counts.reduce((a, b) => a + b, 0),
    },
    config: {
      proxyWallet: serverEnv.PROXY_WALLET,
    },
  });
}
