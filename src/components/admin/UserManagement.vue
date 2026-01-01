<template>
  <div class="user-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon class="title-icon"><User /></el-icon>
          用户管理
        </h1>
        <p class="page-subtitle">管理系统中的所有用户账户</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateDialog" :icon="Plus" size="large">
          添加用户
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon stat-icon-primary">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ total }}</div>
          <div class="stat-label">总用户数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">
          <el-icon><UserFilled /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ users.filter(u => u.role === 'admin').length }}</div>
          <div class="stat-label">管理员</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-info">
          <el-icon><Avatar /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ users.filter(u => u.role === 'user').length }}</div>
          <div class="stat-label">普通用户</div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="filter-section">
      <div class="filter-left">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名、邮箱或手机号..."
          @input="handleSearch"
          clearable
          class="search-input"
          size="large"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="filter-right">
        <el-select v-model="roleFilter" placeholder="筛选角色" clearable size="large" style="width: 150px;">
          <el-option label="全部角色" value="" />
          <el-option label="管理员" value="admin" />
          <el-option label="普通用户" value="user" />
        </el-select>
      </div>
    </div>

    <!-- 用户表格 -->
    <div class="table-container">
      <el-table
        :data="users"
        style="width: 100%"
        :default-sort="{ prop: 'created_at', order: 'descending' }"
        stripe
        class="user-table"
        v-loading="loading"
        height="450"
        :max-height="450"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="80" sortable align="center">
          <template #default="scope">
            <el-tag type="info" size="small">{{ scope.row.id }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="150" sortable>
          <template #default="scope">
            <div class="user-cell">
              <el-avatar :size="32" :src="scope.row.avatar" style="margin-right: 8px;">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username-text">{{ scope.row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="200" sortable show-overflow-tooltip>
          <template #default="scope">
            <div class="email-cell">
              <el-icon style="margin-right: 4px;"><Message /></el-icon>
              {{ scope.row.email }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="140" sortable>
          <template #default="scope">
            <div v-if="scope.row.phone" class="phone-cell">
              <el-icon style="margin-right: 4px;"><Phone /></el-icon>
              {{ scope.row.phone }}
            </div>
            <span v-else class="text-muted">未设置</span>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="120" sortable align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.role === 'admin' ? 'danger' : 'primary'"
              effect="dark"
              round
            >
              {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="120" sortable>
          <template #default="scope">
            <div class="date-cell">
              <el-icon style="margin-right: 4px;"><Calendar /></el-icon>
              {{ formatDate(scope.row.created_at) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                size="small"
                type="primary"
                :icon="Edit"
                @click="editUser(scope.row)"
                circle
                title="编辑"
              />
              <el-popconfirm
                title="确定要删除这个用户吗？"
                @confirm="deleteUser(scope.row.id)"
                confirm-button-text="确定"
                cancel-button-text="取消"
              >
                <template #reference>
                  <el-button
                    size="small"
                    type="danger"
                    :icon="Delete"
                    :disabled="scope.row.role === 'admin'"
                    circle
                    title="删除"
                  />
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑/创建用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :before-close="handleClose"
      destroy-on-close
    >
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editFormRef"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名" clearable>
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" clearable>
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" clearable>
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="isCreateMode">
          <el-input
            v-model="editForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role" placeholder="选择角色" style="width: 100%;">
            <el-option label="普通用户" value="user">
              <div style="display: flex; align-items: center;">
                <el-icon style="margin-right: 8px;"><User /></el-icon>
                普通用户
              </div>
            </el-option>
            <el-option label="管理员" value="admin">
              <div style="display: flex; align-items: center;">
                <el-icon style="margin-right: 8px;"><StarFilled /></el-icon>
                管理员
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="简介" prop="bio">
          <el-input
            v-model="editForm.bio"
            type="textarea"
            :rows="3"
            placeholder="用户简介"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" size="large">取消</el-button>
          <el-button type="primary" @click="submitUser" size="large" :loading="submitting">
            <el-icon style="margin-right: 4px;"><Check /></el-icon>
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Search,
  Plus,
  Edit,
  Delete,
  User,
  UserFilled,
  Avatar,
  Message,
  Phone,
  Calendar,
  StarFilled,
  Lock,
  Check
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from '../../axios/request'

// 数据定义
const users = ref([])
const searchQuery = ref('')
const roleFilter = ref('')
const total = ref(0)
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isCreateMode = ref(false)
const editFormRef = ref()
const editForm = ref({
  id: null,
  username: '',
  email: '',
  phone: '',
  password: '',
  role: 'user',
  bio: ''
})

// 表单验证规则
const editRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await axios.get('/users', {
      params: {
        search: searchQuery.value,
        role: roleFilter.value
      }
    })
    users.value = response.data.data.users || []
    total.value = response.data.data.total || 0
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索用户
const handleSearch = () => {
  fetchUsers()
}

// 显示创建用户对话框
const showCreateDialog = () => {
  isCreateMode.value = true
  dialogTitle.value = '创建用户'
  editForm.value = {
    id: null,
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    bio: ''
  }
  dialogVisible.value = true
}

// 编辑用户
const editUser = (user) => {
  isCreateMode.value = false
  dialogTitle.value = '编辑用户信息'
  editForm.value = { ...user }
  dialogVisible.value = true
}

// 创建用户
const createUser = async () => {
  submitting.value = true
  try {
    await axios.post('/users', editForm.value)
    ElMessage.success('创建用户成功')
    dialogVisible.value = false
    fetchUsers()
  } catch (error) {
    ElMessage.error('创建用户失败')
    console.error('创建用户失败:', error)
  } finally {
    submitting.value = false
  }
}

// 更新用户
const updateUser = async () => {
  submitting.value = true
  try {
    await axios.put(`/users/${editForm.value.id}`, editForm.value)
    ElMessage.success('更新用户成功')
    dialogVisible.value = false
    fetchUsers()
  } catch (error) {
    ElMessage.error('更新用户失败')
    console.error('更新用户失败:', error)
  } finally {
    submitting.value = false
  }
}

// 提交用户（创建或更新）
const submitUser = async () => {
  if (!editFormRef.value) return

  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      if (isCreateMode.value) {
        await createUser()
      } else {
        await updateUser()
      }
    }
  })
}

// 删除用户
const deleteUser = async (userId) => {
  try {
    await axios.delete(`/users/${userId}`)
    ElMessage.success('删除用户成功')
    fetchUsers()
  } catch (error) {
    ElMessage.error('删除用户失败')
    console.error('删除用户失败:', error)
  }
}

// 关闭对话框
const handleClose = () => {
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
  dialogVisible.value = false
}

// 组件挂载时获取用户列表
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management-container {
  /* padding: var(--spacing-xl); */
  /* background-color: var(--bg-primary); */
  /* min-height: 100vh; */
  transition: all var(--transition-normal);
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-xl);
  /* background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%); */
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  color: var(--text-secondary);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.2);
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.title-icon {
  font-size: 32px;
}

.page-subtitle {
  margin: var(--spacing-sm) 0 0 0;
  font-size: 14px;
  opacity: 0.9;
}

.header-right {
  display: flex;
  gap: var(--spacing-md);
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
  color: white;
}

.stat-icon-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%);
}

.stat-icon-success {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.stat-icon-info {
  background: linear-gradient(135deg, #909399 0%, #b3b8bd 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 筛选区域 */
.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
}

.filter-left {
  flex: 1;
  max-width: 500px;
}

.search-input {
  width: 100%;
}

.filter-right {
  display: flex;
  gap: var(--spacing-md);
}

/* 表格容器 */
.table-container {
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  padding: var(--spacing-lg);
  transition: all var(--transition-normal);
}

/* 表格样式 */
.user-table {
  margin-bottom: var(--spacing-lg);
}

:deep(.el-table) {
  background-color: transparent;
  color: var(--text-primary);
  --el-table-tr-bg-color: var(--bg-tertiary); /* 自定义表格行背景色 */
}

:deep(.el-table th) {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  border-color: var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

/* 操作列背景色 */
:deep(.el-table th:nth-last-child(1)),
:deep(.el-table td:nth-last-child(1)) {
  background-color: var(--bg-secondary);
  background-clip: padding-box;
}

:deep(.el-table td) {
  border-color: var(--border-color);
  color: var(--text-primary);
}

:deep(.el-table tr:hover > td) {
  background-color: var(--bg-hover) !important;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: var(--bg-secondary);
}

/* 表格单元格样式 */
.user-cell {
  display: flex;
  align-items: center;
}

.username-text {
  font-weight: 500;
}

.email-cell,
.phone-cell,
.date-cell {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.text-muted {
  color: var(--text-muted);
  font-style: italic;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
}

/* 对话框 */
.dialog-form {
  padding: var(--spacing-md);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

/* 表单样式 */
:deep(.el-input__inner),
:deep(.el-textarea__inner),
:deep(.el-select .el-input__inner),
:deep(.el-select__wrapper) {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
  transition: all var(--transition-normal);
}

:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus),
:deep(.el-select__wrapper:focus-within) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.el-form-item__label) {
  color: var(--text-primary);
  font-weight: 500;
}

:deep(.el-dialog) {
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%);
  color: white;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
}

:deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  padding: var(--spacing-xl);
}

:deep(.el-dialog__footer) {
  background-color: var(--bg-tertiary);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--border-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-management-container {
    padding: var(--spacing-md);
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
  }

  .page-title {
    font-size: 24px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-left {
    max-width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>