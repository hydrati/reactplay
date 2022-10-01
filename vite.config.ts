import { defineConfig } from 'vite'

export default defineConfig({

  build: {
    lib: {
      entry: './src/reactive/index.ts',
      fileName: 'reactivity',
      formats: ['es', 'iife'],
      name: 'Reactivity'
    }
  }
})