# ---- Dev (utilisé par docker-compose, target: dev) ----
# Node 24 (LTS) : Vite 8 exige Node >= 20.19 ou >= 22.12
FROM node:24-slim AS dev
WORKDIR /app

# On copie d'abord UNIQUEMENT les fichiers de dépendances :
# tant qu'ils ne changent pas, Docker réutilise le cache de "npm ci"
# au lieu de tout réinstaller à chaque modification du code.
COPY package*.json ./
RUN npm ci

# Puis le reste du code (en dev, il est de toute façon masqué
# par le volume monté dans docker-compose)
COPY . .

EXPOSE 5173
# --host : écoute sur 0.0.0.0, sinon Vite n'est joignable que depuis
# l'intérieur du conteneur
CMD ["npm", "run", "dev", "--", "--host"]

# ---- Build de production ----
# On repart de l'étape dev : dépendances déjà installées + code copié
FROM dev AS build
# Les variables VITE_* sont "gravées" dans le JS au moment du build :
# elles doivent donc exister ICI, pas au lancement du conteneur.
# (Render les passe en build args)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
# "npm run build" = tsc -b && vite build : vérification des types,
# puis génération des fichiers statiques dans /app/dist
RUN npm run build

# ---- Production : fichiers statiques servis par nginx ----
# Image finale sans Node ni node_modules : juste nginx + le HTML/JS/CSS
FROM nginx:alpine AS prod
# Les fichiers placés dans /etc/nginx/templates/ passent par envsubst
# au démarrage : ${PORT} y est remplacé par sa valeur
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# Render fournit $PORT ; 80 par défaut en local
ENV PORT=80
EXPOSE 80
