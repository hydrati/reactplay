import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsx: 'transform',
    jsxFactory: '__JSX__.h',
    jsxFragment: '__JSX__.Fragment',
    jsxInject: `import * as __JSX__ from '/src/jsx'`
  }
})