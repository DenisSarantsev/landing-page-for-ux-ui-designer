import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/', // важно для абсолютных путей
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        projects: resolve(__dirname, 'projects/index.html')
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: ({ name }) => {
          // Шрифты / картинки оставляем в своих подпапках если нужно
            if (name && /\.(woff2?|ttf|otf)$/.test(name)) return 'fonts/[name][extname]';
            if (name && /\.(png|jpe?g|svg|gif|webp)$/.test(name)) return 'img/[name][extname]';
          return 'assets/[name].[hash][extname]';
        }
      }
    }
  }
});