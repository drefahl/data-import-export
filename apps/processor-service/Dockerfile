FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.json ./

COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src

COPY apps/processor-service/package.json ./apps/processor-service/
COPY apps/processor-service/tsconfig.json ./apps/processor-service/
COPY apps/processor-service/src ./apps/processor-service/src

RUN pnpm install --frozen-lockfile

RUN pnpm --filter shared build
RUN pnpm --filter processor-service build

FROM base AS production

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.json ./

COPY packages/shared/package.json ./packages/shared/
COPY apps/processor-service/package.json ./apps/processor-service/

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/processor-service/dist ./apps/processor-service/dist

RUN mkdir -p /app/uploads /app/processed

ENV NODE_ENV=production

CMD ["node", "apps/processor-service/dist/index.js"]
