import mongoose from "mongoose";
import { env } from "@/src/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var mongooseConn: Promise<typeof mongoose> | undefined;
}

export function connectMongo() {
  if (!global.mongooseConn) {
    global.mongooseConn = mongoose.connect(env.mongodbUri, {
      dbName: "workforce"
    });
  }
  return global.mongooseConn;
}
