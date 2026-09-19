import { createRouter, createWebHistory } from 'vue-router'
import { setDocumentTitle } from '@/utils/setDocumentTitle'




const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Home.vue'),
      name: 'Home',
    },
    {
      path: '/boke',
      component: () => import('@/views/HomeBoke.vue'),
      name: 'HomeBoke',
    },
    {
      path: '/articles',
      component: () => import('@/views/ArticlesP.vue'),
      name: 'Articles',
      meta: {
        title: '文章列表',
      },
    },
    {
      path: '/tags',
      component: () => import('@/views/Tags.vue'),
      name: 'Tags',
      meta: {
        title: '标签列表',
      },
    },

    {
      path: '/moments',
      component: () => import('@/views/Moments.vue'),
      name: 'Moments',
      meta: {
        title: '瞬间',
      },
    },

    {
      path: '/sites',
      component: () => import('@/views/Sites.vue'),
      name: 'Sites',
      meta: {
        title: '站点列表',
      },
    },
    {
      path: '/sitesManage',
      component: () => import('@/views/SitesManager.vue'),
      name: 'SitesManage',
      meta: {
        title: '站点管理',
      },
    },


    {
      path: '/settings',
      component: () => import('@/views/Setting.vue'),
      name: 'Settings',
      meta: {
        title: '站点列表',
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

// 用闭包变量保存遮罩控制器
let overlay: { cover: () => any; reveal: () => any } | null = null

/** 在 App.vue 里注入遮罩实例 */
export function registerOverlay(instance: any) {
  overlay = instance
}

let firstLoad = true

router.beforeEach(async (to, from, next) => {
  // 首次进入不做动画
  if (firstLoad) {
    firstLoad = false
    return next()
  }

  // 同页跳转（仅 hash/query 变化）不做动画
  if (to.path === from.path) return next()



  if (overlay) {
    await overlay.cover()
  }
  next()
})




router.afterEach(async (to: any) => {
  if (overlay) {
    await overlay.reveal()     // 新页面就绪后揭开
  }
  // 1. 如果路由元信息里定义了 title，优先使用
  if (to.meta?.title) {
    setDocumentTitle(to.meta.title);
  }
  else {
    setDocumentTitle('');
  }
});


export default router
