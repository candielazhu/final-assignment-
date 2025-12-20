import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import elementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 根据环境判断是否导入Mock数据
if (import.meta.env.DEV) {
  import('./mock/mockServer.js').then(() => {
    console.log('Mock数据已加载（开发环境）');
  });
}

const app = createApp(App);

app.use(router);
app.use(elementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app');