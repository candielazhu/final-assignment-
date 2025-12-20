import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:3000/api',  // 添加后端API基础地址
  timeout: 10000,
})
export default request