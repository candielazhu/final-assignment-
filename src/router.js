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
      },
      {
        path: 'account',
        name: 'Account',
        component: () => import('./components/Account.vue'),
        meta: { requiresAuth: true, title: '用户中心' } // 需要登录才能访问
      },
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('./components/Admin.vue'),
        meta: { requiresAuth: true, title: '管理员中心' } // 需要登录才能访问
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: () => import('./components/Calendar.vue'),
        meta: { requiresAuth: true, title: '日历' } // 需要登录才能访问
      },
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

// 路由守卫，检查登录状态和角色权限并设置页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  const title = to.meta.title || 'CanDie'
  document.title = `${title}`

  // 检查路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否已登录
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || getCookie('isLoggedIn') === 'true'
    if (isLoggedIn) {
      // 检查是否是管理员路由
      if (to.path.includes('/admin')) {
        try {
          const userInfo = JSON.parse(localStorage.getItem('userInfo'))
          if (userInfo && userInfo.role === 'admin') {
            next() // 是管理员，允许访问
          } else {
            // 不是管理员，显示错误信息并重定向
            import('element-plus').then(({ ElMessage }) => {
              ElMessage.error('权限不足，只有管理员可以访问该页面')
            })
            next('/') // 重定向到首页
          }
        } catch (error) {
          import('element-plus').then(({ ElMessage }) => {
            ElMessage.error('用户信息错误，无法验证权限')
          })
          next('/') // 重定向到首页
        }
      } else {
        next() // 非管理员路由，直接访问
      }
    } else {
      // 如果是访问需要认证的页面但未登录，重定向到登录页
      next('/login')
    }
  } else {
    next() // 不需要认证的路由，直接访问
  }
})

export default router