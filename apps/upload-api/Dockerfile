FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.json ./

COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src

COPY apps/upload-api/package.json ./apps/upload-api/
COPY apps/upload-api/tsconfig.json ./apps/upload-api/
COPY apps/upload-api/src ./apps/upload-api/src

RUN pnpm install --frozen-lockfile

RUN pnpm --filter shared build
RUN pnpm --filter upload-api build

FROM base AS production

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.json ./

COPY packages/shared/package.json ./packages/shared/
COPY apps/upload-api/package.json ./apps/upload-api/

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/upload-api/dist ./apps/upload-api/dist

RUN mkdir -p /app/uploads /app/processed

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "apps/upload-api/dist/index.js"]
