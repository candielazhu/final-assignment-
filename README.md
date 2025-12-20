# 期末考核项目

## 项目介绍
这是一个基于Vue 3 + Vite的现代化博客系统，采用了组件化开发方式和现代化的UI设计，包含用户认证、文章管理、评论功能等核心模块。

## 技术栈
- **前端框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **路由管理**：Vue Router 4
- **UI组件库**：Element Plus
- **HTTP客户端**：Axios 1.2.1
- **图标库**：@element-plus/icons-vue
- **模拟数据**：Mock.js 1.1.0
- **样式**：CSS3 + CSS变量

## 主要功能

### 1. 用户认证
- ✅ 用户登录与注册
- ✅ 登录状态管理（localStorage + Cookie）
- ✅ 动态按钮切换（登录/退出登录）
- ✅ 样式隔离设计

### 2. 文章管理
- ✅ 文章列表展示
- ✅ 文章详情查看
- ✅ 文章发布功能（登录后可用）
- ✅ 支持Markdown渲染
- ✅ 文章锚点导航（支持#、##、###标题）

### 3. 评论系统
- ✅ 独立的评论组件（Comment.vue）
- ✅ 支持评论发布与回复
- ✅ 评论删除功能（带Element Plus Popconfirm确认）
- ✅ 评论计数与实时更新
- ✅ 登录状态控制

### 4. 导航与路由
- ✅ 侧边栏导航菜单
- ✅ 路由重定向（404跳转至index）
- ✅ 登录状态路由控制
- ✅ 发布按钮权限控制

### 5. UI设计
- ✅ 现代化水滴形状设计
- ✅ 响应式布局设计
- ✅ 组件样式隔离
- ✅ 主题色与CSS变量
- ✅ 修复了"待设置"子菜单宽度问题

## 主要依赖

```bash
npm install vue@^3.5.24 vue-router@4 element-plus@2.2.19 axios@1.2.1 mockjs@1.1.0 @element-plus/icons-vue marked@^17.0.1 --save
```

## 运行方式

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 项目结构

```
src/
├── assets/           # 静态资源
├── components/       # 组件
│   ├── Aside.vue     # 侧边栏组件
│   ├── Comment.vue   # 评论组件
│   ├── Footer.vue    # 底部组件
│   ├── Header.vue    # 头部组件
│   ├── Index.vue     # 首页组件
│   ├── Login.vue     # 登录组件
│   ├── Main.vue      # 主内容组件
│   ├── Register.vue  # 注册组件
│   ├── Topic.vue     # 文章详情组件
│   └── Write.vue     # 文章发布组件
├── App.vue           # 根组件
├── main.js           # 入口文件
├── router.js         # 路由配置
└── style.css         # 全局样式
```

## 数据库设计

项目包含完整的数据库设计，支持用户、文章、评论、分类、标签等核心数据模型。

### 核心表结构
- **users**：用户信息表
- **articles**：文章表
- **comments**：评论表
- **categories**：分类表
- **tags**：标签表
- **article_categories**：文章分类关联表
- **article_tags**：文章标签关联表

### 详细设计
查看完整的数据库设计文档：[database-design.md](database-design.md)

## API接口设计

项目定义了完整的RESTful API接口，包括：

### 用户相关接口
- `GET /api/users/:id` - 获取用户信息
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `PUT /api/users/:id` - 更新用户信息

### 文章相关接口
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取文章详情
- `POST /api/articles` - 创建文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章

### 评论相关接口
- `GET /api/articles/:id/comments` - 获取文章评论
- `POST /api/articles/:id/comments` - 添加文章评论
- `DELETE /api/comments/:id` - 删除评论

### 更多接口
查看完整的API接口设计：[database-design.md](database-design.md)（第6节）

## 样式设计

### 设计理念
- 采用现代化的水滴形状设计风格
- 使用CSS变量实现主题色管理
- 组件间样式隔离（scoped + 唯一前缀）
- 响应式布局适配不同屏幕尺寸

### CSS变量
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f7fa;
  --bg-tertiary: #ecf5ff;
  --primary-color: #409eff;
  --border-color: #e4e7ed;
  --text-primary: #303133;
  --text-secondary: #606266;
}
```

## 开发说明

### 1. 组件开发
- 采用Vue 3 Composition API
- 组件命名规范：PascalCase
- 样式隔离：使用scoped属性 + 组件前缀

### 2. 路由管理
- 路由配置文件：`src/router.js`
- 路由守卫：实现登录状态控制
- 路由重定向：404页面重定向至index

### 3. 状态管理
- 登录状态：通过localStorage和Cookie管理
- 组件状态：使用Vue 3响应式API（ref、reactive、computed）

### 4. 数据处理
- 模拟数据：使用Mock.js生成测试数据
- 实际API：通过Axios调用后端接口
- 数据格式：JSON

## 项目亮点

1. **现代化技术栈**：采用Vue 3 + Vite + Element Plus构建
2. **组件化设计**：高度组件化，代码结构清晰
3. **用户体验优化**：流畅的动画效果，友好的交互反馈
4. **响应式设计**：适配各种设备尺寸
5. **完整的数据库设计**：支持真实的后端数据存储
6. **RESTful API设计**：规范的接口设计，便于后端对接
7. **安全性考虑**：登录状态管理，权限控制

## 构建与部署

### 构建命令
```bash
npm run build
```

### 部署说明
1. 构建完成后，将`dist`目录上传至服务器
2. 配置Nginx或其他Web服务器
3. 配置API接口地址

## 版权说明
本项目仅用于期末考核，请勿用于商业用途。
