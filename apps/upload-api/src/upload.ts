import { promises as fs } from "node:fs";
import type { Request, RequestHandler, Response } from "express";
import multer from "multer";
import { config, type FileUploadedNotification, getRedisClient, Logger } from "shared";

const logger = new Logger("UploadHandler");

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await fs.mkdir(config.uploadDir, { recursive: true });
    cb(null, config.uploadDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB máximo
  },
});

export const uploadMiddleware: RequestHandler = upload.single("file");

/**
 * Handler do endpoint POST /upload
 * Salva arquivo localmente e publica notificação no Redis
 */
export async function handleUpload(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Nenhum arquivo foi enviado",
      });
    }

    const { originalname, mimetype, size, filename, path: filePath } = req.file;

    logger.info("Upload concluído", {
      fileName: filename,
      originalName: originalname,
      contentType: mimetype,
      size,
    });

    const notification: FileUploadedNotification = {
      fileName: filename,
      originalName: originalname,
      filePath,
      contentType: mimetype,
      size,
      uploadedAt: new Date().toISOString(),
    };

    const redis = getRedisClient();
    await redis.publish(config.redisChannel, JSON.stringify(notification));

    logger.info("Notificação publicada no Redis", {
      channel: config.redisChannel,
      fileName: filename,
    });

    return res.status(200).json({
      success: true,
      data: {
        fileName: filename,
        originalName: originalname,
        filePath,
        size,
        contentType: mimetype,
        uploadedAt: notification.uploadedAt,
      },
    });
  } catch (error) {
    logger.error("Erro ao processar upload", error);
    return res.status(500).json({
      success: false,
      error: "Erro ao fazer upload do arquivo",
    });
  }
}
