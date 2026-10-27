FROM node:24-bookworm-slim

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY --chown=node:node . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build && chown -R node:node .next

USER node
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0"]
