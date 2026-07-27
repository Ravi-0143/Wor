import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
  base: '/Wor/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-revision-guide',
      apply: 'build',
      writeBundle() {
        const source = path.resolve(__dirname, 'public', 'revision_guide.md');
        const destRoot = path.resolve(__dirname, 'dist', 'revision_guide.md');
        const publicDir = path.resolve(__dirname, 'dist', 'public');
        const destPublic = path.resolve(publicDir, 'revision_guide.md');

        if (fs.existsSync(source)) {
          fs.copyFileSync(source, destRoot);
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
          }
          fs.copyFileSync(source, destPublic);
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
