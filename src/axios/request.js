import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: 'http://localhost:3000/api',  // 使用本地服务器地址
  // baseURL: 'http://47.115.214.161:3000/api',  // 恢复/api前缀，与后端路由匹配
  timeout: 10000,
})

// 请求拦截器：添加认证信息和权限检查
request.interceptors.request.use(
  config => {
    // 检查是否为管理员API
    if (config.url && config.url.includes('/users') && (config.method === 'post' || config.method === 'put' || config.method === 'delete')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        if (!userInfo || userInfo.role !== 'admin') {
          ElMessage.error('权限不足，只有管理员可以执行此操作')
          return Promise.reject(new Error('Unauthorized: Not an admin'))
        }
      } catch (error) {
        ElMessage.error('用户信息错误，无法验证权限')
        return Promise.reject(new Error('Invalid user info'))
      }
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器：处理403权限错误
request.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response && error.response.status === 403) {
      ElMessage.error('服务器拒绝访问：权限不足')
    }
    return Promise.reject(error)
  }
)

export default request