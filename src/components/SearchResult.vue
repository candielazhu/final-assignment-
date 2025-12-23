<template>
    <div class="search-result-container">
        <!-- 搜索条件区域 -->
        <div class="search-filters">
            <el-form :inline="true" :model="searchForm" class="search-form">
                <el-form-item label="标题">
                    <el-input 
                        v-model="searchForm.title" 
                        placeholder="输入标题关键词" 
                        clearable
                        style="width: 200px"
                    />
                </el-form-item>
                <el-form-item label="副标题">       
                    <el-input 
                        v-model="searchForm.subtitle" 
                        placeholder="输入副标题关键词" 
                        clearable
                        style="width: 200px"
                    />
                </el-form-item>
                <el-form-item label="用户">
                    <el-input 
                        v-model="searchForm.username" 
                        placeholder="输入用户名或ID" 
                        clearable
                        style="width: 150px"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 搜索结果统计和排序 -->
        <div class="result-header">
            <div class="result-count">
                找到 <span class="highlight">{{ totalResults }}</span> 条相关结果
            </div>
            <div class="sort-options">
                <span>排序方式：</span>
                <el-select v-model="sortBy" placeholder="请选择" size="small" @change="handleSortChange" style="width: 90px;">
                    <el-option label="相关度" value="relevance" />
                    <el-option label="最新发布" value="createdAt" />
                    <el-option label="浏览量" value="views" />
                </el-select>
            </div>
        </div>

        <!-- 搜索结果列表 -->
        <div class="result-list" v-if="results.length > 0">
            <div 
                v-for="result in results" 
                :key="result.id" 
                class="result-item"
                @click="goToArticle(result.id)"
            >
                <div class="result-title">
                    <h3 v-html="highlightKeywords(result.title, searchKeywords)"></h3>
                </div>
                <div class="result-subtitle" v-if="result.subtitle">
                    <p v-html="highlightKeywords(result.subtitle, searchKeywords)"></p>
                </div>
                <div class="result-meta">
                    <span class="author">{{ result.username }}</span>
                    <span class="time">{{ formatDate(result.createdAt) }}</span>
                    <span class="views">{{ result.views }} 浏览</span>
                </div>
            </div>
        </div>

        <!-- 无结果提示 -->
        <div class="no-results" v-else-if="isSearching">
            <el-empty description="正在搜索..." />
        </div>
        <div class="no-results" v-else-if="totalResults === 0">
            <el-empty>
                <template #image>
                    <el-icon><Search /></el-icon>
                </template>
                <template #description>
                    <div>
                        <p>未找到相关结果</p>
                        <div class="suggestions" v-if="suggestions.length > 0">
                            <p>您可能想要查找：</p>
                            <el-tag 
                                v-for="suggestion in suggestions" 
                                :key="suggestion" 
                                type="info" 
                                @click="handleSuggestionClick(suggestion)"
                                style="margin: 2px"
                            >
                                {{ suggestion }}
                            </el-tag>
                        </div>
                    </div>
                </template>
            </el-empty>
        </div>

        <!-- 搜索历史 -->
        <div class="search-history" v-if="showHistory && searchHistory.length > 0">
            <div class="history-header">
                <h4>搜索历史</h4>
                <el-button link size="small" @click="clearHistory">清空</el-button>
            </div>
            <div class="history-tags">
                <el-tag 
                    v-for="(item, index) in searchHistory" 
                    :key="index" 
                    @click="handleHistoryClick(item)"
                    closable
                    @close="removeHistoryItem(index)"
                >
                    {{ item }}
                </el-tag>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

// 搜索表单
const searchForm = ref({
    title: '',
    subtitle: '',
    username: ''
})

// 搜索状态
const isSearching = ref(false)
const results = ref([])
const totalResults = ref(0)
const sortBy = ref('relevance')

// 搜索关键词
const searchKeywords = ref('')

// 搜索历史
const searchHistory = ref([])
const showHistory = ref(true)

// 搜索建议
const suggestions = ref(['Vue 3', '前端开发', 'JavaScript', 'Element Plus', 'Vue Router'])

// 高亮关键词
const highlightKeywords = (text, keywords) => {
    // 确保text是字符串
    const safeText = typeof text === 'string' ? text : ''
    if (!keywords) return safeText
    const regex = new RegExp(`(${keywords})`, 'gi')
    return safeText.replace(regex, '<span class="highlight">$1</span>')
}

// 格式化日期
const formatDate = (dateString) => {
    // 确保dateString是有效的日期字符串
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? '' : date.toLocaleString()
}

// 跳转到文章详情
const goToArticle = (articleId) => {
    router.push(`/topic/${articleId}`)
}

// 处理搜索
const handleSearch = async () => {
    isSearching.value = true
    
    // 构建搜索关键词
    const keywords = [
        searchForm.value.title,
        searchForm.value.subtitle,
        searchForm.value.username
    ].filter(item => item).join(' ')
    
    // 更新搜索关键词
    searchKeywords.value = keywords
    
    // 保存搜索历史
    if (keywords) {
        addToSearchHistory(keywords)
    }
    
    // 调用搜索API
    try {
        const response = await axios.get('/api/articles/search', {
            params: {
                title: searchForm.value.title,
                subtitle: searchForm.value.subtitle,
                username: searchForm.value.username,
                sortBy: sortBy.value
            }
        })
        
        // 确保results始终是数组
        results.value = Array.isArray(response.data.data) ? response.data.data : []
        totalResults.value = typeof response.data.total === 'number' ? response.data.total : 0
    } catch (error) {
        console.error('搜索失败:', error)
        // 发生错误时，确保results是数组
        results.value = []
        totalResults.value = 0
    } finally {
        isSearching.value = false
        showHistory.value = false
    }
}

// 重置表单
const resetForm = () => {
    searchForm.value = {
        title: '',
        subtitle: '',
        username: ''
    }
    results.value = []
    totalResults.value = 0
    showHistory.value = true
}

// 处理排序变化
const handleSortChange = () => {
    handleSearch()
}

// 搜索历史相关方法
const getSearchHistory = () => {
    try {
        const history = localStorage.getItem('searchHistory')
        if (history) {
            const parsedHistory = JSON.parse(history)
            return Array.isArray(parsedHistory) ? parsedHistory : []
        }
        return []
    } catch (error) {
        console.error('解析搜索历史失败:', error)
        return []
    }
}

const saveSearchHistory = (history) => {
    try {
        localStorage.setItem('searchHistory', JSON.stringify(history))
    } catch (error) {
        console.error('保存搜索历史失败:', error)
    }
}

const addToSearchHistory = (keyword) => {
    let history = getSearchHistory()
    // 去重
    history = history.filter(item => item !== keyword)
    // 添加到开头
    history.unshift(keyword)
    // 最多保存10条
    if (history.length > 10) {
        history = history.slice(0, 10)
    }
    searchHistory.value = history
    saveSearchHistory(history)
}

const removeHistoryItem = (index) => {
    let history = getSearchHistory()
    history.splice(index, 1)
    searchHistory.value = history
    saveSearchHistory(history)
}

const clearHistory = () => {
    searchHistory.value = []
    try {
        localStorage.removeItem('searchHistory')
    } catch (error) {
        console.error('清除搜索历史失败:', error)
    }
}

const handleHistoryClick = (keyword) => {
    searchForm.value.title = keyword
    handleSearch()
}

// 处理搜索建议点击
const handleSuggestionClick = (suggestion) => {
    searchForm.value.title = suggestion
    handleSearch()
}

// 初始化
onMounted(() => {
    // 获取搜索历史
    searchHistory.value = getSearchHistory()
    
    // 从URL参数获取搜索关键词
    const keyword = route.query.keyword
    if (keyword) {
        searchForm.value.title = keyword
        handleSearch()
    }
})
</script>

<style scoped>
.search-result-container {
    padding: 20px;
}

.search-filters {
    background-color: var(--bg-secondary);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-form {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
}

.result-count {
    font-size: 16px;
}

.highlight {
    color: #409eff;
    font-weight: bold;
}

.sort-options {
    display: flex;
    align-items: center;
    gap: 10px;
}

.result-list {
    margin-bottom: 20px;
}

.result-item {
    background-color: var(--bg-secondary);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.result-title h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    color: var(--text-primary);
}

.result-subtitle {
    margin-bottom: 12px;
    color: var(--text-secondary);
}

.result-meta {
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: var(--text-tertiary);
}

.no-results {
    text-align: center;
    padding: 60px 0;
    color: var(--text-secondary);
}

.search-history {
    margin-top: 30px;
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.history-header h4 {
    margin: 0;
    font-size: 16px;
    color: var(--text-primary);
}

.history-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.suggestions {
    margin-top: 16px;
}

.suggestions p {
    margin: 0 0 8px 0;
    font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .search-result-container {
        padding: 10px;
    }
    
    .search-form {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }
    
    .result-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
    
    .sort-options {
        width: 100%;
    }
    
    .result-meta {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
    }
}
</style>