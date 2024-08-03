import { createClient, RedisClientType } from "redis";

import { REDIS_URL, REDIS_NAMESPACE, REDIS_PASS } from "@/config";

declare global {
  var redis: RedisClient;
}

const redisClient =
  global.redis ||
  createClient({ url: REDIS_URL, password: REDIS_PASS, username: 'default' });
if (process.env.NODE_ENV !== "production") globalThis.redis = redisClient;

export interface RedisClient extends Omit<RedisClientType, "json"> {
  json: <T>(key: string) => Promise<T | null>;
}

redisClient.json = async function redisJson<T>(key: string): Promise<T | null> {
  try {
    const data = await redisClient.get(key);
    if (!data) return null;

    const json = JSON.parse(data);
    return json as T;
  } catch (error) {
    return null;
  }
};

redisClient
  .on("ready", () => console.log("Redis Client Ready"))
  .on("error", (err) => console.log("Redis Client Error:", err));

export default async function getRedisClient() {
  if (!redisClient.isReady) await redisClient.connect();

  return redisClient;
}

export const getKeyWithNamespace = function (key: string, ...other: string[]) {
  const keys = [];

  if (REDIS_NAMESPACE !== "") keys.push(REDIS_NAMESPACE);

  keys.push(key);

  if (arguments.length > 1) {
    const args = Array.from(arguments);
    args.shift();
    keys.push(...args);
  }

  return keys.join("_");
};
