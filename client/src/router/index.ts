import { createRouter, createWebHistory } from 'vue-router'
import { setDocumentTitle } from '@/utils/setDocumentTitle'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Start.vue'),
      name: 'Start',
    },
    {
      path: '/boke',
      component: () => import('@/views/HomeBoke.vue'),
      name: 'HomeBoke',
    },
    {
      path: '/articles',
      component: () => import('@/views/Articles.vue'),
      name: 'Articles',
      meta: {
        title: '文章列表',
      },
    },
    {
      path: '/lifes',
      component: () => import('@/views/Life.vue'),
      name: 'Life',
      meta: {
        title: '生活碎片',
      },
    },
    {
      path: '/post/:slug',
      component: () => import('@/views/PostDetail.vue'),


    },
    {
      path: '/workbench',
      component: () => import('@/views/HomeWorkbench.vue'),
      name: 'HomeWorkbench',
    },
    {
      path: '/character',
      component: () => import('@/views/Character.vue'),
      name: 'Character',
    },


  ],
  scrollBehavior(to, from, savedPosition) {

    // 浏览器前进/后退
    if (savedPosition) {
      return savedPosition
    }

    // 普通跳转回到顶部
    return {
      top: 0,
      left: 0,
      behavior: 'smooth'
    }
  }
})

router.afterEach((to: any) => {
  // 1. 如果路由元信息里定义了 title，优先使用
  if (to.meta?.title) {
    setDocumentTitle(to.meta.title);
  }
  else {
    setDocumentTitle('');
  }
});


export default router
