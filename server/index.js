require('dotenv').config();
const express = require('express');
const cors = require('cors');
const articlesRouter = require('./routes/articles');
const { testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api', articlesRouter);

// 测试路由
app.get('/', (req, res) => {
  res.send('后端服务器运行正常');
});

// 测试数据库连接
async function startServer() {
  await testConnection();
  
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}

startServer();