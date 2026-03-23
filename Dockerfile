# Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY openapi ./openapi
COPY migrations ./migrations
COPY src ./src
RUN npm run build

# Run
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/openapi ./openapi
COPY --from=builder /app/migrations ./migrations
EXPOSE 3000
CMD ["node", "dist/server.js"]
