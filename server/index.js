require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const articlesRouter = require('./routes/articles');
const usersRouter = require('./routes/users'); // 导入用户路由
const categoriesRouter = require('./routes/categories'); // 导入分类路由
const commentsRouter = require('./routes/comments'); // 导入评论路由
const { testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 创建uploads目录
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成随机文件名，避免文件名冲突
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

// 文件过滤
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('只允许上传 JPG、PNG 或 WebP 格式的图片'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1 // 只允许上传一个文件
  },
  fileFilter: fileFilter
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(uploadDir));

// 路由
app.use('/api', articlesRouter); // 文章相关路由
app.use('/api/users', usersRouter); // 用户相关路由，使用完整前缀
app.use('/api', categoriesRouter); // 分类相关路由
app.use('/api/comments', commentsRouter); // 评论相关路由

// 测试路由
app.get('/', (req, res) => {
  res.send('后端服务器运行正常');
});

// 上传文件接口
app.post('/api/upload', upload.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '未选择文件'
      });
    }
    
    // 构建文件URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      code: 200,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: '上传成功'
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '文件上传失败'
    });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer错误处理
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        code: 400,
        message: '文件大小不能超过2MB'
      });
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        code: 400,
        message: '只能上传一个文件'
      });
    } else {
      return res.status(400).json({
        code: 400,
        message: err.message
      });
    }
  } else if (err) {
    // 其他错误
    return res.status(400).json({
      code: 400,
      message: err.message
    });
  }
  next();
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