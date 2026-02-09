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

  const userAddresses = serverEnv.USER_ADDRESSES.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((a) => a.toLowerCase());

  const positionsByTrader = await Promise.all(
    userAddresses.map(async (address) => {
      const collection = getCollectionName("user_positions", address);
      const positions = await db
        .collection(collection)
        .find({})
        .sort({ currentValue: -1 })
        .limit(50)
        .toArray();

      const totalValue = positions.reduce(
        (sum, p) => sum + (Number(p.currentValue) || 0),
        0
      );
      const weightedPnl = positions.reduce((sum, p) => {
        const value = Number(p.currentValue) || 0;
        const pnl = Number(p.percentPnl) || 0;
        return sum + value * pnl;
      }, 0);

      const overallPnl = totalValue > 0 ? weightedPnl / totalValue : 0;

      return {
        trader: address,
        totalValue,
        overallPnl,
        positions: positions.map((p) => ({
          asset: p.asset ?? null,
          conditionId: p.conditionId ?? null,
          title: p.title ?? null,
          outcome: p.outcome ?? null,
          currentValue: Number(p.currentValue) || 0,
          percentPnl: Number(p.percentPnl) || 0,
        })),
      };
    })
  );

  return NextResponse.json({ ok: true, positionsByTrader });
}
