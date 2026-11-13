# ---- Dev (utilisé par docker-compose, target: dev) ----
FROM node:20-slim AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# ---- Build de production ----
FROM dev AS build
# Les variables VITE_* sont injectées au moment du build (Render les passe en build args)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build-only

# ---- Production : fichiers statiques servis par nginx ----
FROM nginx:alpine AS prod
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# Render fournit $PORT ; 80 par défaut en local
ENV PORT=80
EXPOSE 80
