import { Router } from "./reactivity";

export const Route = new Router([
  {
    path: '/',
    component: async() => (await import('./Home')).Home
  },
  {
    path: '/second',
    component: async() => (await import('./Second')).default
  }
])