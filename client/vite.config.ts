import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    {
      name: 'suppress-well-known',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/.well-known/')) {
            res.statusCode = 204;
            return res.end();
          }
          next();
        });
      }
    }
  ]
});
