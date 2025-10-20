import Redis from "ioredis";
import { config } from "./config";

let redisClient: Redis | null = null;
let redisSubscriber: Redis | null = null;

/**
 * Retorna uma instância singleton do cliente Redis para publish
 * Usado para publicar notificações quando arquivos são uploadados
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: config.redisHost,
      port: config.redisPort,
      maxRetriesPerRequest: 3,
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log(`Redis conectado em ${config.redisHost}:${config.redisPort}`);
    });
  }
  return redisClient;
}

/**
 * Retorna uma instância singleton do cliente Redis para subscribe
 * Usado pelo processor para escutar notificações
 * IMPORTANTE: Usa uma conexão separada do publisher
 */
export function getRedisSubscriber(): Redis {
  if (!redisSubscriber) {
    redisSubscriber = new Redis({
      host: config.redisHost,
      port: config.redisPort,
      maxRetriesPerRequest: 3,
    });

    redisSubscriber.on("error", (err) => {
      console.error("Redis Subscriber Error:", err);
    });

    redisSubscriber.on("connect", () => {
      console.log("Redis Subscriber conectado");
    });
  }
  return redisSubscriber;
}
