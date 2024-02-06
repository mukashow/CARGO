import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import * as path from 'path';

export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'it-international',
      project: 'cargo-react',
      authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
    }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@public', replacement: path.resolve(__dirname, 'public') },
      { find: '@locales', replacement: path.resolve(__dirname, 'src/locales') },
      { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
      { find: '@hooks', replacement: path.resolve(__dirname, 'src/hooks') },
      { find: '@constants', replacement: path.resolve(__dirname, 'src/constants') },
      { find: '@pages', replacement: path.resolve(__dirname, 'src/pages') },
      { find: '@actions', replacement: path.resolve(__dirname, 'src/store/actions') },
      { find: '@reducers', replacement: path.resolve(__dirname, 'src/store/reducers') },
      { find: '@slices', replacement: path.resolve(__dirname, 'src/store/slices') },
      { find: '@selectors', replacement: path.resolve(__dirname, 'src/store/selectors') },
      { find: '@store', replacement: path.resolve(__dirname, 'src/store/index.js') },
      { find: '@util', replacement: path.resolve(__dirname, 'src/util') },
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/style/_temp.scss";`,
      },
    },
  },
});
