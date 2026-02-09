import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/server/mongo";
import { getServerEnv } from "@/lib/server/env";

export const runtime = "nodejs";

type TradeRow = {
  _id: unknown;
  timestamp?: number;
  userAddress: string;
  side?: string;
  usdcSize?: number;
  price?: number;
  slug?: string;
  eventSlug?: string;
  transactionHash?: string;
  bot?: boolean;
};

function getCollectionName(prefix: string, address: string) {
  return `${prefix}_${address.toLowerCase()}`;
}

export async function GET(req: Request) {
  const serverEnv = getServerEnv();
  await connectMongo();
  const db = (await connectMongo()).connection.db;
  if (!db) {
    return NextResponse.json(
      { ok: false, error: "MongoDB not connected" },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 200);

  const userAddresses = serverEnv.USER_ADDRESSES.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((a) => a.toLowerCase());

  const perUser = Math.max(10, Math.ceil(limit / Math.max(1, userAddresses.length)));

  const rows = (
    await Promise.all(
      userAddresses.map(async (address) => {
        const collection = getCollectionName("user_activities", address);
        const docs = await db
          .collection(collection)
          .find({ type: "TRADE" })
          .sort({ timestamp: -1 })
          .limit(perUser)
          .toArray();

        return docs.map(
          (d) =>
            ({
              _id: d._id,
              timestamp: d.timestamp,
              userAddress: address,
              side: d.side,
              usdcSize: d.usdcSize,
              price: d.price,
              slug: d.slug,
              eventSlug: d.eventSlug,
              transactionHash: d.transactionHash,
              bot: d.bot,
            }) satisfies TradeRow
        );
      })
    )
  ).flat();

  rows.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));

  return NextResponse.json({
    ok: true,
    trades: rows.slice(0, limit).map((t) => ({
      id: String(t._id),
      timestamp: t.timestamp ?? null,
      trader: t.userAddress,
      action: (t.side ?? "").toUpperCase() === "SELL" ? "SELL" : "BUY",
      amountUsd: t.usdcSize ?? null,
      price: t.price ?? null,
      market: t.slug ?? t.eventSlug ?? null,
      txHash: t.transactionHash ?? null,
      isBot: Boolean(t.bot),
    })),
  });
}
