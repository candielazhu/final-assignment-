<template>
    <div class="header">
        <div>
            <el-switch v-model="value1" @change="handleThemeChange" />
        </div>
        <div>
            <el-input v-model="input" style="width: 480px" placeholder="搜索" />
            <el-button @click="handleSearch" style="margin-left: 10px;">
                <el-icon>
                    <Search />
                </el-icon>
            </el-button>
        </div>
        <div class="user">
            <el-popover placement="bottom" trigger="hover" width="120">
                <template #reference>
                    <el-avatar :icon="UserFilled" style="cursor: pointer;" />
                </template>
                <div style="text-align: center; padding: 10px 0;">
                    <el-menu class="el-menu-vertical-demo" @select="handleSelect">
                        <el-menu-item index="1" @click="handleAuthButtonClick">
                            {{ isLoggedIn ? '退出登录' : '登录' }}
                        </el-menu-item>
                    </el-menu>
                </div>
            </el-popover>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

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
}

// 主题切换函数
const toggleTheme = () => {
    const isDark = value1.value
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
}

// 监听主题开关变化
const handleThemeChange = () => {
    toggleTheme()
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
    // 使用window.location.href跳转到首页并刷新
    window.location.href = '/'
}

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
})

// 监听路由变化，更新登录状态
watch(() => route.path, () => {
    checkLoginStatus()
})
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
</style>