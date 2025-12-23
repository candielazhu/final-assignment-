const { executeQuery } = require('../db');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// 获取文章列表
async function getArticles(req, res) {
  try {
    // 调试日志
    console.log('req.query:', req.query);
    console.log('req.body:', req.body);
    
    // 获取当前用户ID（从前端传递或使用默认值）
    const currentUserId = (req.query && req.query.user_id) || (req.body && req.body.user_id) || null;
    
    // 从数据库获取文章列表，过滤条件：
    // 1. 已发布的文章对所有用户可见
    // 2. 草稿文章仅对作者可见
    const sql = `
      SELECT 
        a.id, a.title, a.summary, a.category_id, a.user_id as author_id, 
        a.view_count as reading, a.comment_count, a.created_at, a.updated_at, a.status,
        c.name as category_name,
        u.username as author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.status = 'published' OR (a.status = 'draft' AND a.user_id = ?)
      ORDER BY a.created_at DESC
    `;
    
    const articles = await executeQuery(sql, [currentUserId || 0]);
    
    res.json({
      code: 200,
      message: '获取成功',
      data: articles,
      total: articles.length
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取文章列表失败',
      error: error.message
    });
  }
}

// 获取文章详情
async function getArticleById(req, res) {
  try {
    const id = req.params.id;
    // 调试日志
    console.log('req.query:', req.query);
    console.log('req.body:', req.body);
    
    // 获取当前用户ID（从前端传递或使用默认值）
    const currentUserId = (req.query && req.query.user_id) || (req.body && req.body.user_id) || null;
    
    // 从数据库获取文章基本信息，过滤条件：
    // 1. 已发布的文章对所有用户可见
    // 2. 草稿文章仅对作者可见
    const sql = `
      SELECT 
        a.id, a.title, a.summary, a.category_id, a.user_id as author_id, 
        a.view_count as reading, a.comment_count, a.created_at, a.updated_at, a.status,
        c.name as category_name,
        u.username as author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ? AND (a.status = 'published' OR (a.status = 'draft' AND a.user_id = ?))
    `;
    
    const articles = await executeQuery(sql, [id, currentUserId || 0]);
    
    if (articles.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在'
      });
    }
    
    const articleDetail = articles[0];
    
    // 读取对应id的markdown文件内容
    const mdFilePath = path.join(__dirname, '../../src/services/articles', `${id}.md`);
    let content = '';
    
    if (fs.existsSync(mdFilePath)) {
      content = fs.readFileSync(mdFilePath, 'utf8');
    } else {
      content = `# ${articleDetail.title}\n\n这是${articleDetail.title}的详细内容，支持 **Markdown** 格式。`;
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        ...articleDetail,
        content: content
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取文章详情失败',
      error: error.message
    });
  }
}

// 创建文章
async function createArticle(req, res) {
  try {
    const { title, summary, content, category_id, status } = req.body;
    
    // 验证输入
    if (!title || !content || !summary) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段',
        errors: {
          title: !title ? '标题不能为空' : undefined,
          summary: !summary ? '摘要不能为空' : undefined,
          content: !content ? '内容不能为空' : undefined
        }
      });
    }
    
    // 将Markdown转换为HTML
    const html_content = marked(content);
    
    // 使用前端传递的用户ID，如果没有则使用默认值1
    const user_id = req.body.user_id || 1;
    
    // 提供默认值以避免undefined错误
    const safeCategoryId = category_id || null;
    const safeStatus = status || 'draft';
    
    // 插入文章到数据库
    const sql = `
      INSERT INTO articles (title, summary, content, html_content, category_id, user_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(sql, [title, summary, content, html_content, safeCategoryId, user_id, safeStatus]);
    
    // 获取插入的文章ID
    const articleId = result.insertId;
    
    // 可选：保存Markdown文件到服务器
    const articlesDir = path.join(__dirname, '../../src/services/articles');
    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir, { recursive: true });
    }
    
    const mdFilePath = path.join(articlesDir, `${articleId}.md`);
    fs.writeFileSync(mdFilePath, content, 'utf8');
    
    res.json({
      code: 200,
      message: '文章保存成功',
      data: {
        id: articleId,
        title,
        summary,
        content,
        html_content,
        category_id,
        user_id,
        status
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '创建文章失败',
      error: error.message
    });
  }
}

// 更新文章
async function updateArticle(req, res) {
  try {
    const id = req.params.id;
    const { title, summary, content, category_id, status } = req.body;
    
    // 验证输入
    if (!title || !content || !summary) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段',
        errors: {
          title: !title ? '标题不能为空' : undefined,
          summary: !summary ? '摘要不能为空' : undefined,
          content: !content ? '内容不能为空' : undefined
        }
      });
    }
    
    // 将Markdown转换为HTML
    const html_content = marked(content);
    
    // 更新文章到数据库
    const sql = `
      UPDATE articles 
      SET title = ?, summary = ?, content = ?, html_content = ?, category_id = ?, status = ?
      WHERE id = ?
    `;
    
    const result = await executeQuery(sql, [title, summary, content, html_content, category_id, status, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在'
      });
    }
    
    // 可选：更新对应的Markdown文件
    const articlesDir = path.join(__dirname, '../../src/services/articles');
    const mdFilePath = path.join(articlesDir, `${id}.md`);
    
    if (fs.existsSync(mdFilePath)) {
      fs.writeFileSync(mdFilePath, content, 'utf8');
    }
    
    res.json({
      code: 200,
      message: '文章更新成功'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '更新文章失败',
      error: error.message
    });
  }
}

// 删除文章
async function deleteArticle(req, res) {
  try {
    const id = req.params.id;
    
    // 从数据库中删除文章
    const sql = `DELETE FROM articles WHERE id = ?`;
    
    const result = await executeQuery(sql, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在'
      });
    }
    
    // 可选：删除对应的Markdown文件
    const articlesDir = path.join(__dirname, '../../src/services/articles');
    const mdFilePath = path.join(articlesDir, `${id}.md`);
    
    if (fs.existsSync(mdFilePath)) {
      fs.unlinkSync(mdFilePath);
    }
    
    res.json({
      code: 200,
      message: '文章删除成功'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '删除文章失败',
      error: error.message
    });
  }
}

// 搜索文章
async function searchArticles(req, res) {
  try {
    // 获取搜索参数
    const { title, subtitle, username, sortBy = 'relevance', user_id } = req.query;
    
    // 添加调试日志
    console.log('搜索参数:', { title, subtitle, username, sortBy, user_id });
    
    // 获取当前用户ID（从前端传递或使用默认值）
    const currentUserId = user_id || null;
    
    // 构建查询条件
    let whereClause = "WHERE (a.status = 'published' OR (a.status = 'draft' AND a.user_id = ?))";
    const params = [currentUserId || 0];
    
    // 构建搜索条件
    let hasSearchCondition = false;
    let searchConditions = [];
    
    // 添加标题搜索条件
    if (title) {
      searchConditions.push('(a.title LIKE ? OR a.summary LIKE ? OR a.content LIKE ? OR a.html_content LIKE ? OR u.username LIKE ?)');
      params.push(`%${title}%`, `%${title}%`, `%${title}%`, `%${title}%`, `%${title}%`);
      hasSearchCondition = true;
    }
    
    // 添加副标题（摘要）搜索条件
    if (subtitle) {
      searchConditions.push('(a.summary LIKE ?)');
      params.push(`%${subtitle}%`);
      hasSearchCondition = true;
    }
    
    // 添加用户名搜索条件
    if (username) {
      searchConditions.push('(u.username LIKE ?)');
      params.push(`%${username}%`);
      hasSearchCondition = true;
    }
    
    // 如果有搜索条件，添加到WHERE子句
    if (hasSearchCondition) {
      whereClause += ' AND ' + searchConditions.join(' OR ');
    }
    
    // 构建排序条件
    let orderByClause = 'ORDER BY ';
    switch (sortBy) {
      case 'createdAt':
        orderByClause += 'a.created_at DESC';
        break;
      case 'views':
        orderByClause += 'a.view_count DESC';
        break;
      case 'likes':
        orderByClause += 'a.like_count DESC';
        break;
      case 'comments':
        orderByClause += 'a.comment_count DESC';
        break;
      case 'relevance':
      default:
        // 相关度排序：标题匹配权重更高
        orderByClause += `
          CASE 
            WHEN a.title LIKE ? THEN 1
            WHEN a.summary LIKE ? THEN 2
            WHEN a.content LIKE ? THEN 3
            WHEN a.html_content LIKE ? THEN 4
            WHEN u.username LIKE ? THEN 5
            ELSE 6
          END, 
          a.created_at DESC
        `;
        if (title) {
          params.push(`%${title}%`, `%${title}%`, `%${title}%`, `%${title}%`, `%${title}%`);
        } else if (subtitle) {
          params.push(`%${subtitle}%`, `%${subtitle}%`, `%${subtitle}%`, `%${subtitle}%`, `%${subtitle}%`);
        } else if (username) {
          params.push('%', '%', '%', '%', `%${username}%`);
        } else {
          params.push('%', '%', '%', '%', '%');
        }
        break;
    }
    
    // 构建完整SQL查询
    const sql = `
      SELECT 
        a.id, a.title, a.summary as subtitle, a.user_id, 
        a.view_count as views, a.like_count, a.comment_count, 
        a.created_at, a.updated_at, a.status,
        u.username
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.id
      ${whereClause}
      ${orderByClause}
    `;
    
    // 添加调试日志
    console.log('执行SQL:', sql);
    console.log('参数:', params);
    
    // 执行查询
    const results = await executeQuery(sql, params);
    
    // 添加调试日志
    console.log('搜索结果:', results.length);
    
    res.json({
      code: 200,
      message: '搜索成功',
      data: results,
      total: results.length
    });
  } catch (error) {
    console.error('搜索错误:', error);
    res.status(500).json({
      code: 500,
      message: '搜索失败',
      error: error.message
    });
  }
}

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  searchArticles
};