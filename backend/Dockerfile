# ---------- base : commun à toutes les étapes ----------
FROM node:20-slim AS base
WORKDIR /app
COPY package*.json ./

# ---------- dev : utilisé par docker-compose (target: dev) ----------
# Toutes les dépendances + nodemon pour le rechargement à chaud
FROM base AS dev
RUN npm ci && npm install -g nodemon
COPY . .
CMD ["npm", "run", "start"]

# ---------- build : compilation TypeScript ----------
FROM base AS build
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

# ---------- prod : image d'exécution minimale (étape par défaut) ----------
FROM node:20-slim AS prod
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
# Uniquement les dépendances de production
RUN npm ci --omit=dev && npm cache clean --force
# Uniquement le code compilé
COPY --from=build /app/dist ./dist
# Ne pas tourner en root
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
