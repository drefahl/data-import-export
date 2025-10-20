# 📊 Data Import/Export System

Sistema de importação e exportação de dados construído com **Node.js**, **TypeScript**, **Redis** e **streaming**, demonstrando arquitetura **event-driven** com **monorepo PNPM**.

## 🎯 Objetivo

Projeto demonstrativo de proficiência técnica em:
- Node.js/TypeScript com padrões modernos
- Arquitetura event-driven com Redis Pub/Sub
- Streaming para processamento eficiente de arquivos grandes
- Monorepo com PNPM workspaces
- Containerização com Docker/Docker Compose

## 🏗️ Arquitetura

```
┌─────────────┐          ┌─────────────┐          ┌──────────────────┐
│   Cliente   │────────▶│  Upload API │────────▶│  Redis Pub/Sub   │
└─────────────┘          └─────────────┘          └──────────────────┘
                              │                           │
                              ▼                           ▼
                        ┌──────────┐            ┌──────────────────┐
                        │ ./uploads│            │ Processor Service│
                        └──────────┘            └──────────────────┘
                                                          │
                                                          ▼
                                                  ┌───────────────┐
                                                  │  ./processed  │
                                                  └───────────────┘
```

### Componentes

1. **Upload API** (Express.js)
   - Recebe arquivos via HTTP POST
   - Salva usando streams (Multer diskStorage)
   - Publica notificação no Redis

2. **Processor Service**
   - Subscreve ao canal Redis
   - Processa CSV com streams (csv-parser + Transform)
   - Transforma dados para maiúsculo
   - Salva arquivos processados

3. **Redis**
   - Mensageria Pub/Sub
   - Desacoplamento entre serviços

## 🚀 Quick Start

### Pré-requisitos

- Node.js 22+
- PNPM 10+
- Docker & Docker Compose (opcional)

### Opção 1: Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/drefahl/data-import-export.git
cd data-import-export

# Inicie todos os serviços
docker compose up -d

# Teste o upload
curl -X POST -F "file=@examples/funcionarios.csv" http://localhost:3000/upload

# Ver logs
docker compose logs -f processor-service
```

### Opção 2: Local

```bash
# Clone o repositório
git clone https://github.com/drefahl/data-import-export.git
cd data-import-export

# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env

# Inicie Redis (Docker)
docker compose up -d redis

# Build
pnpm build

# Em terminais separados:
pnpm start:api
pnpm start:processor

# Teste
curl -X POST -F "file=@examples/funcionarios.csv" http://localhost:3000/upload
```

## 📁 Estrutura do Projeto

```
.
├── apps/
│   ├── upload-api/           # API REST de upload
│   │   ├── src/
│   │   │   ├── index.ts      # Express server
│   │   │   └── upload.ts     # Multer config + handlers
│   │   ├── Dockerfile
│   │   └── package.json
│   └── processor-service/    # Serviço de processamento
│       ├── src/
│       │   └── index.ts      # Redis subscriber + CSV processor
│       ├── Dockerfile
│       └── package.json
├── packages/
│   └── shared/               # Biblioteca compartilhada
│       ├── src/
│       │   ├── config.ts     # Configuração + validação Zod
│       │   ├── types.ts      # Schemas Zod + tipos TS
│       │   ├── redis-clients.ts  # Singletons Redis
│       │   ├── logger.ts     # Logger estruturado JSON
│       │   └── index.ts      # Exports
│       └── package.json
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

## 🛠️ Tecnologias

- **Runtime**: Node.js 22+ com TypeScript 5.3+
- **Package Manager**: PNPM 10+ (workspaces)
- **Validação**: Zod (runtime type safety)
- **HTTP Framework**: Express.js 4.x
- **File Upload**: Multer (diskStorage streaming)
- **CSV Processing**: csv-parser + Node.js Streams
- **Messaging**: Redis Pub/Sub (ioredis)
- **Containerização**: Docker + Docker Compose
- **Code Quality**: Biome (linter + formatter)

## Configuração

Arquivo `.env`:

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_CHANNEL=file-uploaded

# API
PORT=3000
```

## 🔄 Fluxo de Dados

1. Cliente faz POST com arquivo CSV
2. Upload API salva via stream e publica no Redis
3. Processor Service recebe notificação
4. CSV é processado linha por linha via stream
5. Dados transformados (UPPERCASE)
6. Arquivo processado salvo com timestamp

## 📊 Processamento CSV

Exemplo de transformação:

**Input** (`funcionarios.csv`):
```csv
nome,cargo,salario
João Silva,Desenvolvedor,5000
Maria Santos,Gerente,8000
```

**Output** (`processed-*.csv`):
```csv
nome,cargo,salario,processedAt,processedRow
JOÃO SILVA,DESENVOLVEDOR,5000,2025-10-20T12:34:56.789Z,1
MARIA SANTOS,GERENTE,8000,2025-10-20T12:34:56.790Z,2
```

## 🤝 Contribuindo

Projeto criado para fins educacionais e demonstração de competências técnicas.

## 📄 Licença

MIT

---

⭐ Se este projeto foi útil, considere dar uma estrela!
