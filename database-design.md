# 项目数据库设计

## 1. 数据库概述

本数据库设计用于支持基于Vue 3的期末考核项目，包含用户管理、文章发布和浏览等核心功能。

## 2. 数据库表结构

### 2.1 用户表（users）

| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码（加密存储） |
| email | VARCHAR(100) | UNIQUE | 电子邮箱 |
| avatar | VARCHAR(255) | DEFAULT 'default.jpg' | 头像URL |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| last_login_at | DATETIME | NULL | 最后登录时间 |

### 2.2 文章表（articles）

| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 文章ID |
| user_id | INT | FOREIGN KEY REFERENCES users(id) | 作者ID |
| title | VARCHAR(200) | NOT NULL | 文章标题 |
| content | TEXT | NOT NULL | 文章内容（Markdown格式） |
| html_content | TEXT | NOT NULL | 转换后的HTML内容 |
| status | TINYINT | DEFAULT 1 | 文章状态（1：发布，0：草稿） |
| view_count | INT | DEFAULT 0 | 浏览量 |
| like_count | INT | DEFAULT 0 | 点赞数 |
| comment_count | INT | DEFAULT 0 | 评论数 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.3 分类表（categories）

| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 分类ID |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 分类名称 |
| description | VARCHAR(200) | NULL | 分类描述 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.4 文章分类关联表（article_categories）

| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| article_id | INT | FOREIGN KEY REFERENCES articles(id) | 文章ID |
| category_id | INT | FOREIGN KEY REFERENCES categories(id) | 分类ID |
| PRIMARY KEY | (article_id, category_id) | 联合主键 | 确保文章与分类的唯一关联 |

### 2.5 标签表（tags）

| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 标签ID |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 标签名称 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.6 文章标签关联表（article_tags）

| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| article_id | INT | FOREIGN KEY REFERENCES articles(id) | 文章ID |
| tag_id | INT | FOREIGN KEY REFERENCES tags(id) | 标签ID |
| PRIMARY KEY | (article_id, tag_id) | 联合主键 | 确保文章与标签的唯一关联 |

### 2.7 评论表（comments）

| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 评论ID |
| article_id | INT | FOREIGN KEY REFERENCES articles(id) | 文章ID |
| user_id | INT | FOREIGN KEY REFERENCES users(id) | 评论者ID |
| content | TEXT | NOT NULL | 评论内容 |
| parent_id | INT | FOREIGN KEY REFERENCES comments(id) | 父评论ID（用于回复） |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

## 3. 数据库关系图

```
+----------------+      +----------------+      +----------------+      +----------------+
|    users       |      |   articles     |      |   comments     |      |  categories    |
+----------------+      +----------------+      +----------------+      +----------------+
| id             |<-----| id             |<-----| id             |      | id             |
| username       |      | user_id        |      | article_id     |      | name           |
| password       |      | title          |      | user_id        |      | description    |
| email          |      | content        |      | content        |      +----------------+
| avatar         |      | html_content   |      | parent_id      |             ^
| created_at     |      | status         |      | created_at     |             |
| updated_at     |      | view_count     |      | updated_at     |             |
| last_login_at  |      | like_count     |      +----------------+             |
+----------------+      | comment_count  |                                  |
                        | created_at     |    +----------------+             |
                        | updated_at     |    |   tags         |             |
                        +----------------+    +----------------+             |
                                ^             | id             |             |
                                |             | name           |             |
                                |             | created_at     |             |
                                |             | updated_at     |             |
                                |             +----------------+             |
                                |                      ^                     |
                                |                      |                     |
                                |      +----------------+      +----------------+
                                |      | article_tags   |      |article_categories|
                                |      +----------------+      +----------------+
                                +----->| article_id     |      | article_id     |
                                       | tag_id         |      | category_id    |
                                       +----------------+      +----------------+
```

## 4. 数据库创建SQL

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS vue_final_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE vue_final_project;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    avatar VARCHAR(255) DEFAULT 'default.jpg',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建文章表
CREATE TABLE IF NOT EXISTS articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    html_content TEXT NOT NULL,
    status TINYINT DEFAULT 1,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(200) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建文章分类关联表
CREATE TABLE IF NOT EXISTS article_categories (
    article_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (article_id, category_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建标签表
CREATE TABLE IF NOT EXISTS tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建文章标签关联表
CREATE TABLE IF NOT EXISTS article_tags (
    article_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    parent_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 5. 数据索引设计

```sql
-- 为常用查询字段创建索引
CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_created_at ON articles(created_at);
CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
```

## 6. 数据库访问接口设计

### 6.1 用户相关接口
- `GET /api/users/:id` - 获取用户信息
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `PUT /api/users/:id` - 更新用户信息

### 6.2 文章相关接口
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取文章详情
- `POST /api/articles` - 创建文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章
- `GET /api/articles/category/:id` - 获取分类下的文章
- `GET /api/articles/tag/:id` - 获取标签下的文章

### 6.3 分类相关接口
- `GET /api/categories` - 获取分类列表
- `GET /api/categories/:id` - 获取分类详情

### 6.4 标签相关接口
- `GET /api/tags` - 获取标签列表
- `GET /api/tags/:id` - 获取标签详情

### 6.5 评论相关接口
- `GET /api/articles/:id/comments` - 获取文章评论
- `POST /api/articles/:id/comments` - 添加文章评论
- `DELETE /api/comments/:id` - 删除评论

## 7. 数据库优化建议

1. **索引优化**：根据实际查询情况，调整索引策略
2. **分表分库**：当数据量增大时，考虑对文章表和评论表进行分表
3. **缓存优化**：对热门文章和分类数据使用缓存
4. **读写分离**：在高并发场景下，考虑使用读写分离
5. **定期备份**：设置定期备份策略，确保数据安全

## 8. 数据库安全建议

1. **密码加密**：使用bcrypt等算法对密码进行加密存储
2. **SQL注入防护**：使用参数化查询，避免SQL注入
3. **权限控制**：为不同用户分配适当的数据库权限
4. **数据验证**：在应用层和数据库层都进行数据验证
5. **定期审计**：定期审计数据库操作日志

## 9. 总结

本数据库设计提供了一个完整的数据存储方案，支持项目的核心功能需求。通过合理的表结构设计和索引优化，可以提高数据库的查询效率和性能。同时，通过安全措施和优化建议，可以确保数据库的安全性和可靠性。