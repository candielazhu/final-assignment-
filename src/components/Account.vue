<template>
  <div class="account-container">
    <div class="account-header">
      <div class="user-profile">
        <el-avatar :size="100" :src="userInfo.avatar" />
        <div class="user-info">
          <h2>{{ userInfo.username }}</h2>
          <p class="user-role">{{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}</p>
          <p class="join-date">加入时间：{{ formatDate(userInfo.createTime || '2023-01-01') }}</p>
          <p>手机号：{{  }}</p>
          <p>简介：{{  }}</p>
        </div>
      </div>
    </div>

    <div class="account-content">
      <el-tabs v-model="activeTab" class="account-tabs">
        <el-tab-pane label="个人信息" name="profile">
          <div class="profile-content">
            <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="100px" class="profile-form">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="profileForm.username" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item label="头像">
                <div class="avatar-upload-container">
                  <!-- 图片预览 -->
                  <div class="avatar-preview-wrapper">
                    <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar-preview" />
                    <el-icon v-else class="avatar-placeholder"><User /></el-icon>
                  </div>
                  
                  <!-- 上传按钮 -->
                  <el-upload
                    ref="avatarUploadRef"
                    class="avatar-uploader"
                    :action="'http://localhost:3000/api/upload'"
                    :show-file-list="false"
                    :on-success="handleAvatarSuccess"
                    :on-error="handleAvatarError"
                    :on-start="handleUploadStart"
                    :before-upload="beforeAvatarUpload"
                    :on-progress="handleUploadProgress"
                    :file-list="fileList"
                    name="avatar"
                  >
                    <el-button type="primary" size="small" :loading="uploading">
                      {{ uploading ? '上传中...' : '选择头像' }}
                    </el-button>
                  </el-upload>
                  
                  <!-- 上传进度 -->
                  <el-progress v-if="uploading" :percentage="uploadProgress" :stroke-width="2" style="margin-top: 10px; width: 200px;" />
                  
                  <!-- 上传提示 -->
                  <div class="upload-tips">
                    支持 JPG、PNG、WebP 格式，文件大小不超过 2MB
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="简介">
                <el-input
                  v-model="profileForm.bio"
                  type="textarea"
                  :rows="4"
                  placeholder="介绍一下自己吧"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updateProfile">更新信息</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="我的文章" name="articles">
          <MyArticles :user-id="userInfo.id" />
        </el-tab-pane>

        <el-tab-pane label="我的评论" name="comments">
          <div class="comments-content">
            <el-table :data="userComments" style="width: 100%" class="comments-table">
              <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
              <el-table-column prop="article_title" label="所属文章" show-overflow-tooltip />
              <el-table-column prop="created_at" label="评论时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button size="small" @click="viewArticle(row.article_id)">查看文章</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="账户设置" name="settings">
          <div class="settings-content">
            <el-form ref="settingsFormRef" :model="settingsForm" :rules="settingsRules" label-width="120px" class="settings-form">
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="settingsForm.newPassword" type="password" placeholder="留空则不修改密码" />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="settingsForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updatePassword">更新密码</el-button>
                <el-button @click="resetPasswordForm">重置</el-button>
              </el-form-item>
            </el-form>
            <div class="danger-zone">
              <h3>危险操作</h3>
              <el-button type="danger" @click="handleAccountDeletion">删除账户</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, User } from '@element-plus/icons-vue'
import request from '../axios/request'
import MyArticles from './MyArticles.vue'

const router = useRouter()

// 激活的标签页
const activeTab = ref('profile')

// 用户信息
const userInfo = reactive({
  id: '',
  username: '',
  avatar: '',
  role: '',
  createTime: '',
  email: '',
  phone: ''
})

// 个人信息表单
const profileForm = reactive({
  id: '',
  username: '',
  avatar: '',
  bio: '',
  email: '',
  phone: ''
})

// 个人信息验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: false, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: false, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
}

// 设置表单
const settingsForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

// 设置验证规则
const settingsRules = {
  newPassword: [
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 表单引用
const profileFormRef = ref(null)
const settingsFormRef = ref(null)



// 评论数据
const userComments = ref([])
const totalComments = ref(0)

// 获取当前用户信息
const fetchUserInfo = async () => {
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const parsedUserInfo = JSON.parse(userInfoStr)
      Object.assign(userInfo, parsedUserInfo)
      Object.assign(profileForm, {
        id: parsedUserInfo.id,
        username: parsedUserInfo.username,
        avatar: parsedUserInfo.avatar,
        bio: parsedUserInfo.bio || '',
        email: parsedUserInfo.email || '',
        phone: parsedUserInfo.phone || ''
      })
    } else {
      ElMessage.error('未找到用户信息')
      router.push('/login')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}



// 获取用户评论
const fetchUserComments = async () => {
  try {
    if (!userInfo.id) return
    
    const response = await request({
      url: '/comments/user',
      method: 'get',
      params: {
        user_id: userInfo.id
      }
    })
    
    if (response.data.code === 200) {
      userComments.value = response.data.data.list || []
      totalComments.value = response.data.data.total || 0
    } else {
      ElMessage.error('获取评论列表失败')
      userComments.value = []
      totalComments.value = 0
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    // 静默处理，不影响主功能
    userComments.value = []
    totalComments.value = 0
  }
}

// 更新用户信息
const updateProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    
    const response = await request({
      url: `/users/${userInfo.id}`,
      method: 'put',
      data: {
        username: profileForm.username,
        avatar: profileForm.avatar,
        bio: profileForm.bio,
        email: profileForm.email,
        phone: profileForm.phone
      }
    })
    
    if (response.data.code === 200) {
      ElMessage.success('个人信息更新成功')
      
      // 更新本地存储
      const updatedUserInfo = {
        ...userInfo,
        username: profileForm.username,
        avatar: profileForm.avatar,
        bio: profileForm.bio,
        email: profileForm.email,
        phone: profileForm.phone
      }
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
      
      // 更新全局状态
      Object.assign(userInfo, updatedUserInfo)
    } else {
      ElMessage.error(response.data.message || '更新失败')
    }
  } catch (error) {
    console.error('更新个人信息失败:', error)
    ElMessage.error('更新失败，请稍后重试')
  }
}

// 更新密码
const updatePassword = async () => {
  if (!settingsFormRef.value) return
  
  try {
    await settingsFormRef.value.validate()
    
    if (!settingsForm.newPassword) {
      ElMessage.warning('请输入新密码')
      return
    }
    
    const response = await request({
      url: `/users/${userInfo.id}/password`,
      method: 'put',
      data: {
        oldPassword: '', // 实际应用中需要用户提供旧密码
        newPassword: settingsForm.newPassword
      }
    })
    
    if (response.data.code === 200) {
      ElMessage.success('密码更新成功')
      resetPasswordForm()
    } else {
      ElMessage.error(response.data.message || '更新密码失败')
    }
  } catch (error) {
    console.error('更新密码失败:', error)
    ElMessage.error('更新密码失败，请稍后重试')
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  settingsForm.newPassword = ''
  settingsForm.confirmPassword = ''
  if (settingsFormRef.value) {
    settingsFormRef.value.clearValidate()
  }
}

// 验证确认密码
function validateConfirmPassword(rule, value, callback) {
  if (value !== settingsForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 头像上传相关变量
const avatarUploadRef = ref(null)
const fileList = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)

// 客户端图片压缩
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        // 创建画布
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // 设置压缩后的尺寸，保持宽高比
        const MAX_WIDTH = 800
        const MAX_HEIGHT = 800
        let { width, height } = img
        
        if (width > height && width > MAX_WIDTH) {
          height *= MAX_WIDTH / width
          width = MAX_WIDTH
        } else if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height
          height = MAX_HEIGHT
        }
        
        canvas.width = width
        canvas.height = height
        
        // 绘制压缩后的图片
        ctx.drawImage(img, 0, 0, width, height)
        
        // 将画布转换为 Blob 对象
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // 创建新的文件对象
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              reject(new Error('图片压缩失败'))
            }
          },
          file.type,
          0.8 // 压缩质量，0.8 表示 80%
        )
      }
      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
  })
}

// 上传前验证
const beforeAvatarUpload = async (file) => {
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('头像图片只能是 JPG、PNG 或 WebP 格式!')
    return false
  }
  
  // 验证文件大小
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  
  try {
    // 客户端压缩图片
    const compressedFile = await compressImage(file)
    
    // 替换原始文件为压缩后的文件
    return compressedFile
  } catch (error) {
    console.error('图片压缩失败:', error)
    ElMessage.error('图片压缩失败，请稍后重试')
    return false
  }
}

// 上传开始处理
const handleUploadStart = (file) => {
  uploading.value = true
  uploadProgress.value = 0
}

// 上传进度处理
const handleUploadProgress = (event, file, fileList) => {
  if (event && event.total > 0) {
    uploadProgress.value = Math.round((event.loaded / event.total) * 100)
  }
}

// 上传成功处理
const handleAvatarSuccess = (response, file, fileList) => {
  uploading.value = false
  uploadProgress.value = 0
  
  try {
    if (response && response.data && response.data.url) {
      profileForm.avatar = response.data.url
      ElMessage.success('头像上传成功')
    } else {
      // 模拟上传成功，使用本地文件URL
      profileForm.avatar = URL.createObjectURL(file.raw)
      ElMessage.success('头像上传成功（模拟）')
    }
  } catch (error) {
    console.error('处理上传成功响应失败:', error)
    // 使用本地文件URL作为最后的备份
    profileForm.avatar = URL.createObjectURL(file.raw)
    ElMessage.success('头像上传成功（模拟）')
  }
}

// 上传失败处理
const handleAvatarError = (error, file, fileList) => {
  uploading.value = false
  uploadProgress.value = 0
  
  console.error('头像上传失败:', error)
  ElMessage.error('头像上传失败，请稍后重试')
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// 查看文章
const viewArticle = (articleId) => {
  router.push(`/topic/${articleId}`)
}

// 处理账户删除
const handleAccountDeletion = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除您的账户吗？此操作不可撤销，所有数据将被永久删除。',
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await request({
      url: `/users/${userInfo.id}`,
      method: 'delete'
    })
    
    if (response.data.code === 200) {
      ElMessage.success('账户已删除')
      
      // 清除本地存储
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userInfo')
      document.cookie = 'isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      
      // 跳转到首页
      router.push('/')
    } else {
      ElMessage.error(response.data.message || '删除失败')
    }
  } catch (error) {
    console.error('删除账户失败:', error)
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

// 组件挂载时获取用户信息和数据
onMounted(() => {
  fetchUserInfo()
  fetchUserComments()
})
</script>

<style scoped>
.account-container {
  padding: var(--spacing-xl);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 80vh;
  transition: all var(--transition-normal);
}

.account-header {
  background-color: var(--bg-tertiary);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-xl);
  border: 1px solid var(--border-color);
  text-align: left;
  transition: all var(--transition-normal);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.user-info {
  flex: 1;
}

.user-info h2 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 24px;
  color: var(--text-primary);
  font-weight: 600;
}

.user-role {
  font-size: 16px;
  color: var(--text-secondary);
  margin: var(--spacing-xs) 0;
}

.join-date {
  font-size: 14px;
  color: var(--text-muted);
  margin: var(--spacing-xs) 0;
}

.account-content {
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.account-tabs {
  background-color: var(--bg-tertiary);
}

:deep(.el-tabs__item) {
  color: var(--text-primary);
  transition: all var(--transition-normal);
  margin-left: var(--spacing-xl);
}

:deep(.el-tabs__item.is-active) {
  color: var(--primary-color);
}

:deep(.el-tab-pane) {
  padding: var(--spacing-xl);
}

.profile-form {
  max-width: 600px;
}

.avatar-uploader {
  border: 1px dashed var(--border-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all var(--transition-normal);
  width: 100px;
  height: 100px;
}

.avatar-uploader:hover {
  border-color: var(--primary-color);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: var(--text-muted);
  width: 100px;
  height: 100px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.avatar-preview-wrapper {
  width: 150px;
  height: 150px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  margin-bottom: var(--spacing-sm);
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all var(--transition-normal);
}

.avatar-preview:hover {
  transform: scale(1.02);
}

.avatar-placeholder {
  font-size: 64px;
  color: var(--text-muted);
}

.avatar-uploader {
  margin-bottom: var(--spacing-sm);
}

.upload-tips {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: var(--spacing-xs);
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-normal);
}

.articles-actions {
  margin-bottom: var(--spacing-xl);
  text-align: left;
}

.articles-table, .comments-table {
  margin-bottom: var(--spacing-xl);
  height: 46vh;
  --el-table-tr-bg-color: var(--bg-primary);
}

.settings-form {
  max-width: 500px;
  margin-bottom: var(--spacing-xl);
}

.danger-zone {
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-color);
}

.danger-zone h3 {
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
  font-weight: 500;
}

:deep(.el-table) {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  transition: all var(--transition-normal);
}

:deep(.el-table th) {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

:deep(.el-table td) {
  border-color: var(--border-color);
  color: var(--text-primary);
}

:deep(.el-table tr:hover > td) {
  background-color: var(--bg-hover);
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
  transition: all var(--transition-normal);
  border-radius: var(--border-radius-sm);
}

:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.el-form-item__label) {
  color: var(--text-primary);
}

:deep(.el-upload-dragger) {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  transition: all var(--transition-normal);
  border-radius: var(--border-radius-md);
}

:deep(.el-upload-dragger:hover) {
  border-color: var(--primary-color);
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: var(--border-color);
}

:deep(.el-divider) {
  border-color: var(--border-color);
}
</style>