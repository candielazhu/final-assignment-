import { createRouter, createWebHistory } from 'vue-router'

// 获取Cookie的辅助函数
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

const routes = [
  {
    path: '/',
    name: 'Index',
    component: () => import('./components/Index.vue'),
    meta: { requiresAuth: false }, // 允许未登录用户访问
    children: [
      {
        path: '', // 默认子路由
        name: 'Main',
        component: () => import('./components/Main.vue'),
        meta: { requiresAuth: false, title: '首页' } // 允许未登录用户访问
      },
      {
        path: 'topic/:id',
        name: 'Topic',
        component: () => import('./components/Topic.vue'),
        meta: { requiresAuth: false, title: '文章详情' } // 允许未登录用户访问
      },
      {
        path: 'write',
        name: 'Write',
        component: () => import('./components/Write.vue'),
        meta: { requiresAuth: true, title: '写文章' } // 需要登录才能访问
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('./components/SearchResult.vue'),
        meta: { requiresAuth: false, title: '搜索结果' } // 允许未登录用户访问
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('./components/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('./components/Register.vue'),
    meta: { title: '注册' }
  },
  // 404页面路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/' // 未找到页面时重定向到index页面
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫，检查登录状态并设置页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  const title = to.meta.title || 'CanDie'
  document.title = `${title}`

  // 检查路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否已登录
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || getCookie('isLoggedIn') === 'true'
    if (isLoggedIn) {
      next() // 已登录，继续访问
    } else {
      // 如果是访问需要认证的页面但未登录，重定向到登录页
      next('/login')
    }
  } else {
    next() // 不需要认证的路由，直接访问
  }
})

export default router