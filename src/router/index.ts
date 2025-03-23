import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'contacto',
      component: () => import('../views/ContactoView.vue'),
    },
    {
      path: '/graph',
      name: 'graph',
      component: () => import('../views/GraphView.vue'),
    },
    {
      path: '/johnson',
      name: 'johnson',
      component: () => import('../views/JohnsonView.vue'),
    },
    {
      path: '/asignacion',
      name: 'asignacion',
      component: () => import('../views/AsignacionView.vue'),
    },
    {
      path: '/noroeste',
      name: 'noroeste',
      component: () => import('../views/NorOesteView.vue'),
    },
    {
      path: '/sort',
      name: 'sort',
      component: () => import('../views/SortView.vue'),
    },
    {
      path: '/tree',
      name: 'tree',
      component: () => import('../views/TreeView.vue'),
    },
    {
      path: '/fft',
      name: 'fft',
      component: () => import('../views/FFTView.vue'),
    },
    {
      path: '/bigo',
      name: 'bigo',
      component: () => import('../views/BigOView.vue'),
    },
    {
      path: '/ia',
      name: 'ia',
      component: () => import('../views/IAView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

export default router;
