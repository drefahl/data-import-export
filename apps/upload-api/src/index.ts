import cors from "cors";
import express from "express";
import { config, Logger } from "shared";
import { handleUpload, uploadMiddleware } from "./upload";

const logger = new Logger("UploadAPI");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/upload", uploadMiddleware, handleUpload);

app.listen(config.port, () => {
  logger.info(`API de Upload rodando na porta ${config.port}`);
  logger.info(`Diretório de upload: ${config.uploadDir}`);
  logger.info(`Canal Redis: ${config.redisChannel}`);
});
