import * as path from "node:path";
import * as dotenv from "dotenv";
import { z } from "zod";
import { type Config, ConfigSchema } from "./types";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

function loadConfig(): Config {
  const projectRoot = path.resolve(__dirname, "../../../");

  const rawConfig = {
    uploadDir: path.resolve(projectRoot, "uploads"),
    processedDir: path.resolve(projectRoot, "processed"),
    redisHost: process.env.REDIS_HOST || "localhost",
    redisPort: process.env.REDIS_PORT ? Number.parseInt(process.env.REDIS_PORT, 10) : 6379,
    redisChannel: process.env.REDIS_CHANNEL || "file-uploaded",
    port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
  };

  try {
    return ConfigSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`);
      throw new Error(
        `Erro na validação das variáveis de ambiente:\n${errorMessages.join("\n")}\n\nVerifique seu arquivo .env`,
      );
    }
    throw error;
  }
}

export const config = loadConfig();
