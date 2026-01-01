<template>
    <div class="admin-container">
        <h1>管理员中心</h1>

        <!-- 管理员功能导航 -->
        <div class="admin-nav">
            <el-menu :default-active="activeMenu" class="admin-menu" mode="horizontal" @select="handleMenuSelect">
                <el-menu-item index="users">用户管理</el-menu-item>
                <el-menu-item index="articles">文章管理</el-menu-item>
                <el-menu-item index="comments">评论管理</el-menu-item>
            </el-menu>
        </div>

        <!-- 内容区域 -->
        <div class="admin-content">
            <UserManagement v-if="activeMenu === 'users'" />
            <div v-else-if="activeMenu === 'articles'" class="management-section">
                <!-- <h3>文章管理</h3> -->
                <ArticleManagement />
            </div>
            <div v-else-if="activeMenu === 'comments'" class="management-section">
                <!-- <h3>评论管理</h3> -->
                <CommentManagement />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import UserManagement from './admin/UserManagement.vue'
import ArticleManagement from './admin/ArticleManagement.vue'
import CommentManagement from './admin/CommentManagement.vue'

// 当前激活的菜单项
const activeMenu = ref('users')
const isAdmin = ref(true)

// 检查用户是否为管理员
const checkAdminPermission = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    isAdmin.value = userInfo && userInfo.role === 'admin'
    
    if (!isAdmin.value) {
      ElMessage.error('权限不足，只有管理员可以访问管理员中心')
      return false
    }
    return true
  } catch (error) {
    ElMessage.error('用户信息错误，无法验证权限')
    return false
  }
}

// 处理菜单选择
const handleMenuSelect = (index) => {
  if (checkAdminPermission()) {
    activeMenu.value = index
  }
}

// 组件挂载时检查权限
onMounted(() => {
  checkAdminPermission()
})
</script>

<style scoped>
.admin-container {
    padding: var(--spacing-xl);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    min-height: 80vh;
    transition: all var(--transition-normal);
}

.admin-nav {
    margin: var(--spacing-lg) 0;
}

.admin-menu {
    border-bottom: none;
    background-color: var(--bg-tertiary);
    border-radius: var(--border-radius-md);
    padding: 0 var(--spacing-md);
    --el-menu-text-color: var(--text-primary);
}

.management-section {
    padding: var(--spacing-xl);
    background-color: var(--bg-tertiary);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--border-color);
}

.admin-content {
    margin-top: var(--spacing-lg);
}
</style>