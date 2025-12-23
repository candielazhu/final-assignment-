<template>
    <div class="header">
        <div>
            <el-switch v-model="value1" @change="handleThemeChange" />
        </div>
        <div>
            <el-autocomplete
                v-model="input"
                :fetch-suggestions="querySearch"
                :trigger-on-focus="false"
                :debounce="300"
                placeholder="搜索"
                @select="handleSearch"
                @keyup.enter="handleSearch"
                style="width: 480px"
            >
                <template #prefix>
                    <el-icon class="el-input__icon"><Search /></el-icon>
                </template>
                <template #suffix>
                    <el-button
                        @click="handleSearch"
                        type="primary"
                        size="small"
                    >
                        搜索
                    </el-button>
                </template>
                <template #default="{ item }">
                    <div class="suggestion-item">
                        <el-icon><Search /></el-icon>
                        <span>{{ item.value }}</span>
                    </div>
                </template>
                <template #footer>
                    <div class="search-footer" v-if="searchHistory.length > 0">
                        <div class="history-header">
                            <span>搜索历史</span>
                            <el-button link size="small" @click="clearHistory">清空</el-button>
                        </div>
                        <div class="history-tags">
                            <el-tag
                                v-for="(item, index) in searchHistory"
                                :key="index"
                                @click="handleHistoryClick(item)"
                                closable
                                @close="removeHistoryItem(index)"
                                size="small"
                            >
                                {{ item }}
                            </el-tag>
                        </div>
                    </div>
                </template>
            </el-autocomplete>
        </div>
        <div class="user">
            <el-popover placement="bottom" trigger="hover" width="120">
                <template #reference>
                    <div class="user-info" style="display: flex; align-items: center; cursor: pointer;">
                        <span v-if="isLoggedIn && userInfo.username" class="username">{{ userInfo.username }}</span>
                        <el-avatar :icon="UserFilled" :src="userInfo.avatar" style="margin-right: 8px;" />
                    </div>
                </template>
                <div style="text-align: center; padding: 10px 0;">
                    <el-menu class="el-menu-vertical-demo"> 
                        <el-menu-item-group>
                            <el-menu-item index="1" @click="handleAuthButtonClick">
                                {{ isLoggedIn ? '退出登录' : '登录' }}
                            </el-menu-item>
                            <el-menu-item index="2" v-if="isLoggedIn">
                                个人中心
                            </el-menu-item>
                        </el-menu-item-group>
                    </el-menu>
                </div>
            </el-popover>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled, Search } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 接收父组件传递的Props
const props = defineProps({
    userInfo: {
        type: Object,
        default: () => ({
            username: '',
            avatar: '',
            role: ''
        })
    }
})

// 定义发送给父组件的事件
const emit = defineEmits(['search', 'theme-change'])

// 注入全局状态
const appState = inject('appState', null)

// 主题切换开关状态
const value1 = ref(true)
const input = ref('')
// 登录状态
const isLoggedIn = ref(false)

// 检查登录状态
const checkLoginStatus = () => {
    const cookieLoggedIn = document.cookie.includes('isLoggedIn=true')
    const localStorageLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    isLoggedIn.value = cookieLoggedIn || localStorageLoggedIn

    // 更新全局状态
    if (appState) {
        appState.isLoggedIn.value = isLoggedIn.value
    }
}

// 主题切换函数
const toggleTheme = () => {
    const isDark = value1.value
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')

    // 通知父组件主题变化
    emit('theme-change', isDark)
}

// 监听主题开关变化
const handleThemeChange = () => {
    toggleTheme()
}

// 搜索历史记录
const searchHistory = ref([])

// 搜索建议列表
const searchSuggestions = ref(['Vue 3', '前端开发', 'JavaScript', 'Element Plus', 'Vue Router', 'CSS', 'HTML', '响应式设计', '组件化开发', '状态管理'])

// 初始化搜索历史
const initSearchHistory = () => {
    try {
        const history = localStorage.getItem('searchHistory')
        if (history) {
            const parsedHistory = JSON.parse(history)
            searchHistory.value = Array.isArray(parsedHistory) ? parsedHistory : []
        }
    } catch (error) {
        console.error('解析搜索历史失败:', error)
        searchHistory.value = []
    }
}

// 保存搜索历史
const saveSearchHistory = (history) => {
    localStorage.setItem('searchHistory', JSON.stringify(history))
}

// 添加到搜索历史
const addToSearchHistory = (keyword) => {
    if (!keyword) return
    
    // 去重
    let history = searchHistory.value.filter(item => item !== keyword)
    // 添加到开头
    history.unshift(keyword)
    // 最多保存10条
    if (history.length > 10) {
        history = history.slice(0, 10)
    }
    
    searchHistory.value = history
    saveSearchHistory(history)
}

// 清除搜索历史
const clearHistory = () => {
    searchHistory.value = []
    localStorage.removeItem('searchHistory')
}

// 移除单个搜索历史项
const removeHistoryItem = (index) => {
    let history = searchHistory.value
    history.splice(index, 1)
    searchHistory.value = history
    saveSearchHistory(history)
}

// 点击搜索历史项
const handleHistoryClick = (keyword) => {
    input.value = keyword
    handleSearch()
}

// 搜索建议查询函数
const querySearch = (queryString, cb) => {
    if (!queryString) {
        cb([])
        return
    }
    
    // 过滤搜索建议
    const suggestions = searchSuggestions.value
        .filter(item => item.toLowerCase().includes(queryString.toLowerCase()))
        .map(item => ({ value: item }))
    
    cb(suggestions)
}

// 搜索事件处理
const handleSearch = () => {
    if (input.value.trim()) {
        // 添加到搜索历史
        addToSearchHistory(input.value.trim())
        // 发送搜索事件给父组件
        emit('search', input.value.trim())
    }
}

// 登录/退出按钮点击事件
const handleAuthButtonClick = () => {
    if (isLoggedIn.value) {
        // 执行退出登录逻辑
        logout()
    } else {
        // 跳转到登录页面
        router.push('/login')
    }
}

const logout = () => {
    // 清除登录状态
    localStorage.removeItem('isLoggedIn')
    document.cookie = 'isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    ElMessage.success('已退出登录')

    // 更新登录状态
    checkLoginStatus()

    // 使用window.location.href跳转到首页并刷新
    window.location.href = '/'
}

// 系统主题变化监听器
let themeMediaQuery = null
let themeChangeListener = null

// 初始化主题和登录状态
onMounted(() => {
    // 从本地存储获取主题偏好，否则使用系统偏好
    const savedTheme = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = savedTheme ? savedTheme === 'dark' : systemDark

    value1.value = isDark
    toggleTheme()

    // 检查登录状态
    checkLoginStatus()
    
    // 初始化搜索历史
    initSearchHistory()

    // 监听系统主题变化
    themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    themeChangeListener = (e) => {
        if (!localStorage.getItem('theme')) { // 只有在用户未设置主题时才响应系统变化
            value1.value = e.matches
            toggleTheme()
        }
    }
    themeMediaQuery.addEventListener('change', themeChangeListener)
})

// 组件卸载前清理资源
onUnmounted(() => {
    // 移除系统主题变化监听器
    if (themeMediaQuery && themeChangeListener) {
        themeMediaQuery.removeEventListener('change', themeChangeListener)
    }
})

// 监听路由变化，更新登录状态
watch(() => route.path, () => {
    checkLoginStatus()
})

// 监听用户信息变化
watch(() => props.userInfo, (newInfo) => {
    console.log('Header 收到用户信息更新:', newInfo)
}, { deep: true })
</script>

<style scoped>
.header {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding: 10px;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
}

.user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.username {
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 500;
    margin-right: 5px;
    transition: all 0.3s ease;
}

.username:hover {
    color: var(--primary-color);
}

/* 搜索建议样式 */
.suggestion-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    gap: 8px;
}

.suggestion-item:hover {
    background-color: var(--bg-hover);
}

/* 搜索历史样式 */
.search-footer {
    padding: 12px;
    border-top: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    color: var(--text-secondary);
}

.history-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .header {
        flex-direction: column;
        gap: 12px;
        padding: 12px;
    }
    
    .el-autocomplete {
        width: 100% !important;
    }
}
</style>