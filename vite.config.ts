import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
  },
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    globals: true,
    environment: 'node',
    reporters: ['verbose'],
  },
});
