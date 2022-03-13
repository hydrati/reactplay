import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsx: 'transform',
    jsxFactory: '__JSX__h',
    jsxFragment: '__JSX__Fragment',
    jsxInject: `import {h as __JSX__h,Fragment as __JSX__Fragment} from '/src/jsx'`
  },
  build: {
    // lib: {
    //   entry: './src/reactivity.ts',
    //   fileName: 'reactivity',
    //   formats: ['es', 'iife'],
    //   name: 'Reactivity'
    // }
  }
})