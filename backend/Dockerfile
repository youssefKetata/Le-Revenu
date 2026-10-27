FROM node:24-bookworm-slim

WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY --chown=node:node backend/ ./
RUN chown node:node /app/backend
USER node
ENV STRAPI_TELEMETRY_DISABLED=true
# The admin build reads database config but never connects; runtime credentials stay outside the image.
RUN DATABASE_PASSWORD=build-only npm run build

WORKDIR /app
COPY --chown=node:node scripts/seed-demo.mjs ./scripts/seed-demo.mjs
ENV NODE_ENV=production
EXPOSE 1337
CMD ["sh", "-c", "node scripts/seed-demo.mjs && cd backend && exec node node_modules/@strapi/strapi/bin/strapi.js start"]
