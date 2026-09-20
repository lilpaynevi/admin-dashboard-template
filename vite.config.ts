import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  /**
   * `loadEnv` et non `process.env` : Vite ne charge les fichiers `.env` qu'après
   * avoir évalué cette configuration. Lu directement, `process.env.VITE_*`
   * serait systématiquement vide.
   *
   * Troisième argument `''` : sans lui, seules les variables préfixées `VITE_`
   * sont renvoyées.
   */
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    resolve: {
      alias: {
        // `import.meta.url` plutôt que `__dirname` : le projet est en modules
        // ES (`"type": "module"`), où `__dirname` n'existe pas.
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: {
      port: 5173,
      /**
       * Le proxy évite CORS en développement : le front appelle `/api/...` sur
       * son propre domaine, Vite relaie vers l'API. En production, c'est le
       * reverse proxy (nginx, Vercel…) qui joue ce rôle — voir `.env.example`.
       */
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },

    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          /**
           * Recharts et l'écosystème React pèsent lourd et ne changent presque
           * jamais : les isoler garde leur empreinte stable entre deux
           * déploiements, donc en cache chez l'utilisateur.
           */
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
          },
        },
      },
    },
  };
});
