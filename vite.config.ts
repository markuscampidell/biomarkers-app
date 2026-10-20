import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative paths so the build works from any URL (domain root or a sub-folder like GitHub Pages).
  base: './',
  plugins: [react()],
  server: { host: true },
  preview: { host: true },
});
