const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories');

// 获取分类列表
router.get('/categories', categoryController.getCategories);

module.exports = router;