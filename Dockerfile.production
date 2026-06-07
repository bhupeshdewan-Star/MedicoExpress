# Multi-stage security hardened production image
# Stage 1: Build static React front-end
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY apps/web/package*.json ./
RUN npm install --include=optional
COPY apps/web/ ./
RUN npm run build

# Stage 2: Build Node.js backend & aggregate code
FROM node:20-alpine AS final
RUN apk add --no-cache curl

# Create non-root user and restrict access
RUN addgroup -S clincommand && adduser -S clinadmin -G clincommand
WORKDIR /app

COPY package*.json ./
COPY apps/api-core/package*.json ./apps/api-core/
COPY apps/web/package*.json ./apps/web/
RUN npm install --omit=dev

# Copy workspaces code
COPY apps/api-core ./apps/api-core
COPY packages ./packages
COPY observability ./observability
COPY db ./db
COPY --from=frontend-builder /app/build-output ./apps/web/build-output

# Grant ownership to non-root admin
RUN chown -R clinadmin:clincommand /app
USER clinadmin

ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/system/health || exit 1

CMD ["node", "apps/api-core/server.js"]
