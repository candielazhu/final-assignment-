import Mock from 'mockjs'
import article from '../services/article.json'

Mock.mock('/mock/getarticles', 'get', {
    code: 200,             // 状态码
    message: '获取成功',    // 状态描述
    data: article,         // 文章列表数据
    total: article.length  // 文章总数
})

// 获取单篇文章详情
Mock.mock(/\/mock\/getarticle\/\d+/, 'get', (req) => {
    const id = parseInt(req.url.match(/\d+/)[0])
    const articleDetail = article.find(item => item.id === id)
    
    if (articleDetail) {
        return {
            code: 200,
            message: '获取成功',
            data: {
                ...articleDetail,
                content: `# ${articleDetail.title}\n\n这是${articleDetail.title}的详细内容，支持 **Markdown** 格式。\n\n## 章节一\n\n这是章节一的内容，包含一些 **重要** 信息。\n\n## 章节二\n\n这是章节二的内容，包含更多细节。\n\n### 小节二.一\n\n这是小节二.一的内容，更加具体。\n\n### 小节二.二\n\n这是小节二.二的内容，提供额外信息。\n\n## 章节三\n\n这是章节三的内容，总结全文。`
            }
        }
    } else {
        return {
            code: 404,
            message: '文章不存在'
        }
    }
})