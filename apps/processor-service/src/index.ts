import { createReadStream, createWriteStream, promises as fs } from "node:fs";
import path from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import csv from "csv-parser";
import { config, type FileUploadedNotification, getRedisSubscriber, Logger } from "shared";

const logger = new Logger("ProcessorService");

/**
 * Processa um arquivo CSV fazendo streaming:
 * 1. Lê do diretório de upload usando stream
 * 2. Transforma linha por linha (adiciona timestamp)
 * 3. Salva no diretório processed usando stream
 */
async function processFile(notification: FileUploadedNotification) {
  const { fileName, filePath } = notification;

  logger.info("Iniciando processamento", { fileName, filePath });

  await fs.mkdir(config.processedDir, { recursive: true });

  const destFileName = `processed-${fileName}`;
  const destPath = path.join(config.processedDir, destFileName);

  let rowCount = 0;

  try {
    const transformStream = new Transform({
      objectMode: true,
      transform(row: any, _encoding, callback) {
        rowCount++;

        const uppercasedRow: Record<string, any> = {};
        for (const [key, value] of Object.entries(row)) {
          uppercasedRow[key] = typeof value === "string" ? value.toUpperCase() : value;
        }

        const transformed = {
          ...uppercasedRow,
          processedAt: new Date().toISOString(),
          processedRow: rowCount,
        };

        // Converte de volta para CSV (formato simples)
        const line =
          rowCount === 1
            ? `${Object.keys(transformed).join(",")}\n${Object.values(transformed).join(",")}\n`
            : `${Object.values(transformed).join(",")}\n`;
        callback(null, line);
      },
    });

    // Pipeline: Ler arquivo -> Parse CSV -> Transform -> Escrever arquivo
    await pipeline(createReadStream(filePath), csv(), transformStream, createWriteStream(destPath));

    logger.info("Processamento concluído", {
      sourceFile: fileName,
      destFile: destFileName,
      destPath,
      rowsProcessed: rowCount,
    });
  } catch (error) {
    logger.error("Erro ao processar arquivo", {
      fileName,
      error,
    });
    throw error;
  }
}

async function handleMessage(channel: string, message: string) {
  try {
    const notification: FileUploadedNotification = JSON.parse(message);

    logger.info("Mensagem recebida do Redis", {
      channel,
      fileName: notification.fileName,
    });

    if (!notification.fileName.endsWith(".csv")) {
      logger.warn("Arquivo ignorado (não é CSV)", {
        fileName: notification.fileName,
      });
      return;
    }

    await processFile(notification);

    logger.info("Mensagem processada com sucesso", {
      fileName: notification.fileName,
    });
  } catch (error) {
    logger.error("Erro ao processar mensagem", {
      message,
      error,
    });
  }
}

async function startSubscriber() {
  const subscriber = getRedisSubscriber();

  logger.info("Iniciando subscriber Redis", {
    channel: config.redisChannel,
    host: config.redisHost,
    port: config.redisPort,
  });

  await subscriber.subscribe(config.redisChannel);

  subscriber.on("message", handleMessage);

  subscriber.on("error", (error) => {
    logger.error("Erro no subscriber", error);
  });

  logger.info("Processor Service rodando e aguardando mensagens...");
}

startSubscriber().catch((error) => {
  logger.error("Erro ao iniciar subscriber", error);
  process.exit(1);
});
