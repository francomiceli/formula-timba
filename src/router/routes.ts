import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { requiresAuth: true }
      },
      { 
        path: 'prediction', 
        name: 'prediction',
        component: () => import('pages/IndexPage.vue'),
        meta: { requiresAuth: true }
      },
      { 
        path: 'leagues', 
        name: 'leagues',
        component: () => import('pages/LeaguesPage.vue'),
        meta: { requiresAuth: true }
      },
      { 
        path: 'leagues/:slug', 
        name: 'league-detail',
        component: () => import('pages/LeagueDetailPage.vue'),
        meta: { requiresAuth: true }
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/LoginPage.vue'),
    meta: { guest: true }
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;