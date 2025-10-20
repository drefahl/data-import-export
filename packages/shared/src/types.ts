import { z } from "zod";

export const ConfigSchema = z.object({
  // Diretórios locais
  uploadDir: z.string().default("./uploads"),
  processedDir: z.string().default("./processed"),

  // Redis
  redisHost: z.string().default("localhost"),
  redisPort: z.number().int().positive().default(6379),
  redisChannel: z.string().default("file-uploaded"),

  // API
  port: z.number().int().positive().default(3000),
});

export type Config = z.infer<typeof ConfigSchema>;

export interface FileUploadedNotification {
  fileName: string;
  originalName: string;
  filePath: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}
