import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Dans Docker sous Windows, les événements "fichier modifié" ne
      // traversent pas le volume monté : Vite doit vérifier lui-même
      // régulièrement (polling). Activé seulement dans Docker, via
      // la variable d'env définie dans docker-compose.
      usePolling: process.env.VITE_USE_POLLING === 'true',
    },
  },
})
