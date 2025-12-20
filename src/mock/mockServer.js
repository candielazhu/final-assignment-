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
        try {
            // 读取对应id的markdown文件
            const fs = require('fs')
            const path = require('path')
            const mdFilePath = path.join(__dirname, '../services/articles', `${id}.md`)
            let content = ''
            
            if (fs.existsSync(mdFilePath)) {
                content = fs.readFileSync(mdFilePath, 'utf8')
            } else {
                // 如果文件不存在，使用默认内容
                content = `# ${articleDetail.title}\n\n这是${articleDetail.title}的详细内容，支持 **Markdown** 格式。`
            }
            
            return {
                code: 200,
                message: '获取成功',
                data: {
                    ...articleDetail,
                    content: content
                }
            }
        } catch (error) {
            console.error('读取markdown文件失败:', error)
            return {
                code: 500,
                message: '读取文章内容失败',
                data: null
            }
        }
    } else {
        return {
            code: 404,
            message: '文章不存在'
        }
    }
})