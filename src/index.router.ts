import { Router } from "./reactivity";

export const Route = new Router([
  {
    path: '/',
    component: async() => (await import('./pages/Home')).Home
  },
  {
    path: '/second',
    component: async() => (await import('./pages/Second')).default
  }
])