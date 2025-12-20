const { executeQuery } = require('../db');

// 获取分类列表
async function getCategories(req, res) {
  try {
    const sql = 'SELECT id, name, description FROM categories ORDER BY name ASC';
    const categories = await executeQuery(sql);
    
    res.json({
      code: 200,
      message: '获取分类列表成功',
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取分类列表失败',
      error: error.message
    });
  }
}

module.exports = {
  getCategories
};