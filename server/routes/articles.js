const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articles');

// 获取文章列表
router.get('/articles', articleController.getArticles);

// 获取文章详情
router.get('/articles/:id', articleController.getArticleById);

// 创建文章
router.post('/articles', articleController.createArticle);

module.exports = router;