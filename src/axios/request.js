import axios from 'axios'

const request = axios.create({
  baseURL: 'http://47.115.214.161/api',  // 恢复/api前缀，与后端路由匹配
  timeout: 10000,
})
export default request