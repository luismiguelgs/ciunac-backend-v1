# Etapa de build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

RUN npm install --omit=dev

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main.js"]
