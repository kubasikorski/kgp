import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/peak/:peak_slug',
      name: 'peak-details',
      component: () => import('../views/PeakDetails.vue'),
    },
  ],
})

export default router
