import mongoose from "mongoose";
import { getServerEnv } from "@/lib/server/env";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as {
  mongoose: MongooseCache | undefined;
};

const cache: MongooseCache = globalForMongoose.mongoose ?? {
  conn: null,
  promise: null,
};

globalForMongoose.mongoose = cache;

export async function connectMongo() {
  const { MONGO_URI } = getServerEnv();
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGO_URI, {
        bufferCommands: false,
      })
      .then((m) => m);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
