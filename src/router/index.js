import { createRouter, createWebHashHistory } from 'vue-router'
import store from '@/store'
import { externalRoutes } from '@/config/externalRoutes'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/statistics'
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/Statistics.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/time-series',
    name: 'TimeSeries',
    component: () => import('@/views/TimeSeries.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sensor-association',
    name: 'SensorAssociation',
    component: () => import('@/views/SensorAssociation.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/data-endpoints',
    name: 'DataEndpoints',
    component: () => import('@/views/DataEndpoints.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth && !store.state.jwt) {
    window.location.href = `${externalRoutes.vitrina}#/login`
    return next(false)
  }
  next()
})

export default router
