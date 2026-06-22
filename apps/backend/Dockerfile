# ── Build stage ───────────────────────────────
FROM node:22-alpine AS build
WORKDIR /repo

# Install workspace deps (root + shared + backend)
COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY apps/backend/package.json apps/backend/
RUN npm install

# Copy sources and build
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/backend apps/backend
RUN npm run build -w @carrymate/shared \
 && npm run build -w @carrymate/backend

# ── Runtime stage ─────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY apps/backend/package.json apps/backend/
RUN npm install --omit=dev

COPY --from=build /repo/packages/shared/dist packages/shared/dist
COPY --from=build /repo/apps/backend/dist apps/backend/dist
COPY apps/backend/prisma apps/backend/prisma
RUN npx --workspace @carrymate/backend prisma generate

EXPOSE 3000
CMD ["node", "apps/backend/dist/server.js"]
