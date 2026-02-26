# EasyStay 后端 API

## 📋 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [项目结构](#项目结构)
- [API 接口](#api-接口)
- [数据模型](#数据模型)
- [中间件](#中间件)
- [数据库初始化](#数据库初始化)
- [部署指南](#部署指南)
- [常见问题](#常见问题)

## 项目简介

**EasyStay 后端 API** 是一个基于 Node.js + Express + SQLite + Sequelize 构建的 RESTful API 服务，为前端管理系统和小程序提供数据支持。系统支持用户认证、酒店管理、订单处理、财务管理等核心功能。

## 技术栈

### 核心技术
- **框架**: Express.js v5
- **数据库**: SQLite + Sequelize ORM
- **认证**: JWT (JSON Web Token)
- **密码加密**: bcryptjs
- **环境变量**: dotenv
- **验证**: validator
- **跨域**: CORS

### 依赖包
```json
{
  "dependencies": {
    "express": "^5.0.0",
    "sequelize": "^6.0.0",
    "sqlite3": "^5.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.0.0",
    "dotenv": "^16.0.0",
    "validator": "^13.0.0",
    "cors": "^2.0.0",
    "body-parser": "^1.0.0",
    "dayjs": "^1.0.0"
  }
}
```

## 快速开始

### 1. 环境准备

确保你已安装：
- Node.js 18+ 
- npm 9+ 或 yarn

### 2. 安装依赖

```bash
# 在项目根目录执行
npm run install:all

# 或单独在本目录执行
cd nodejs_backend
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```env
PORT=3002
JWT_SECRET=your_strong_jwt_secret_key
DB_PATH=./database.sqlite
RESET_DB=true
```

### 4. 初始化数据库

```bash
# 在 nodejs_backend 目录执行
npm run seed
```

### 5. 启动服务

```bash
# 在项目根目录执行
npm run dev

# 或单独在本目录执行
cd nodejs_backend
npm run dev
```

服务启动后访问：http://localhost:3002

## 配置说明

### 环境变量

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| PORT | number | 3002 | 服务端口 |
| JWT_SECRET | string | - | JWT 密钥 |
| DB_PATH | string | ./database.sqlite | 数据库文件路径 |
| RESET_DB | boolean | false | 是否重置数据库 |

### 重要配置文件

- **src/config/env.js** - 环境变量配置
- **src/config/db.js** - 数据库连接配置
- **src/config/ensureSchema.js** - 数据库表结构确保

## 项目结构

```
nodejs_backend/
├── src/
│   ├── config/             # 配置文件
│   │   ├── env.js           # 环境变量
│   │   ├── db.js            # 数据库连接
│   │   └── ensureSchema.js  # 表结构确保
│   │
│   ├── middlewares/        # 中间件
│   │   ├── auth.js          # 认证中间件
│   │   └── error.js         # 错误处理
│   │
│   ├── models/             # 数据模型
│   │   ├── User.js          # 用户模型
│   │   ├── Hotel.js         # 酒店模型
│   │   ├── RoomType.js      # 房型模型
│   │   ├── Order.js         # 订单模型
│   │   ├── Review.js        # 评价模型
│   │   └── index.js         # 模型导出
│   │
│   ├── routes/             # API 路由
│   │   ├── auth.js          # 认证路由
│   │   ├── hotels.js        # 酒店路由
│   │   ├── rooms.js         # 房型路由
│   │   ├── orders.js        # 订单路由
│   │   ├── reviews.js       # 评价路由
│   │   ├── finance.js       # 财务路由
│   │   └── ...              # 其他路由
│   │
│   ├── seed/               # 数据初始化
│   │   ├── seed.js          # 主种子文件
│   │   ├── seed-hotels-100.js # 100家酒店数据
│   │   └── seed-hotels-2to5star.js # 2-5星级酒店数据
│   │
│   ├── utils/              # 工具函数
│   │   └── response.js      # 响应工具
│   │
│   ├── app.js              # 应用入口
│   └── server.js           # 服务器启动
├── .env.example            # 环境变量示例
├── package.json            # 项目配置
├── package-lock.json       # 依赖锁定
└── README.md               # 本文件
```

## API 接口

### 认证模块 (`/api/auth`)

| 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|
| POST | /api/auth/login | 用户登录 | 公开 |
| POST | /api/auth/register | 用户注册 | 公开 |
| GET | /api/auth/me | 获取当前用户 | 需要认证 |

### 酒店模块 (`/api/hotels`)

| 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|
| GET | /api/hotels | 获取酒店列表 | 需要认证 |
| GET | /api/hotels/:id | 获取酒店详情 | 需要认证 |
| POST | /api/hotels | 创建酒店 | 商家 |
| PUT | /api/hotels/:id | 更新酒店信息 | 商家 |
| DELETE | /api/hotels/:id | 删除酒店 | 商家 |

### 房型模块 (`/api/rooms`)

| 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|
| GET | /api/rooms | 获取房型列表 | 需要认证 |
| GET | /api/rooms/:id | 获取房型详情 | 需要认证 |
| POST | /api/rooms | 创建房型 | 商家 |
| PUT | /api/rooms/:id | 更新房型信息 | 商家 |
| DELETE | /api/rooms/:id | 删除房型 | 商家 |

### 订单模块 (`/api/orders`)

| 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|
| GET | /api/orders | 获取订单列表 | 需要认证 |
| GET | /api/orders/:id | 获取订单详情 | 需要认证 |
| POST | /api/orders | 创建订单 | 公开 |
| PUT | /api/orders/:id | 更新订单状态 | 商家 |
| DELETE | /api/orders/:id | 取消订单 | 商家/用户 |

### 评价模块 (`/api/reviews`)

| 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|
| GET | /api/reviews | 获取评价列表 | 需要认证 |
| GET | /api/reviews/:id | 获取评价详情 | 需要认证 |
| POST | /api/reviews | 创建评价 | 用户 |
| PUT | /api/reviews/:id | 更新评价 | 用户 |
| DELETE | /api/reviews/:id | 删除评价 | 商家 |

### 财务模块 (`/api/finance`)

| 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|
| GET | /api/finance/summary | 获取财务汇总 | 商家 |
| GET | /api/finance/transactions | 获取交易明细 | 商家 |
| POST | /api/finance/withdrawal | 创建提现申请 | 商家 |
| GET | /api/finance/withdrawals | 获取提现列表 | 商家/管理员 |

### 公共酒店模块 (`/api/public/hotels`)

| 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|
| GET | /api/public/hotels | 公开酒店列表 | 公开 |
| GET | /api/public/hotels/:id | 公开酒店详情 | 公开 |
| GET | /api/public/hotels/search | 酒店搜索 | 公开 |

## 数据模型

### User 模型

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 用户ID |
| username | STRING | 用户名 |
| password_hash | STRING | 密码哈希 |
| name | STRING | 姓名 |
| role | STRING | 角色 (admin/merchant/user) |
| email | STRING | 邮箱 |
| phone | STRING | 手机号 |
| created_at | DATE | 创建时间 |
| updated_at | DATE | 更新时间 |

### Hotel 模型

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 酒店ID |
| name | STRING | 酒店名称 |
| city | STRING | 城市 |
| district | STRING | 区域 |
| address | STRING | 地址 |
| description | TEXT | 酒店描述 |
| star_rating | INTEGER | 星级 (1-5) |
| facilities | JSON | 设施列表 |
| images | JSON | 图片列表 |
| merchant_id | INTEGER | 商家ID |
| status | STRING | 状态 (active/inactive) |
| created_at | DATE | 创建时间 |
| updated_at | DATE | 更新时间 |

### RoomType 模型

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 房型ID |
| hotel_id | INTEGER | 酒店ID |
| name | STRING | 房型名称 |
| description | TEXT | 房型描述 |
| price | DECIMAL | 价格 |
| capacity | INTEGER | 容纳人数 |
| size | INTEGER | 面积 (平方米) |
| amenities | JSON |  amenities |
| images | JSON | 图片列表 |
| status | STRING | 状态 (active/inactive) |
| created_at | DATE | 创建时间 |
| updated_at | DATE | 更新时间 |

### Order 模型

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 订单ID |
| user_id | INTEGER | 用户ID |
| hotel_id | INTEGER | 酒店ID |
| room_type_id | INTEGER | 房型ID |
| check_in_date | DATE | 入住日期 |
| check_out_date | DATE | 离店日期 |
| guests | INTEGER | 入住人数 |
| total_price | DECIMAL | 总价 |
| status | STRING | 状态 (pending/confirmed/canceled/completed) |
| created_at | DATE | 创建时间 |
| updated_at | DATE | 更新时间 |

## 中间件

### 认证中间件 (`middlewares/auth.js`)

- 验证 JWT token
- 提取用户信息
- 权限控制

### 错误处理中间件 (`middlewares/error.js`)

- 统一错误处理
- 错误日志记录
- 友好错误响应

## 数据库初始化

### 种子数据

执行 `npm run seed` 会初始化以下数据：

1. **默认用户**
   - 管理员: admin / 123456
   - 商家: merchant / 123456

2. **测试酒店数据**
   - 100家2-5星级酒店
   - 每家酒店3-5个房型

3. **初始配置**
   - 系统默认设置
   - 基础数据

### 重置数据库

```bash
# 删除数据库文件
rm database.sqlite

# 重新初始化
npm run seed
```

## 部署指南

### 生产环境部署

1. **构建前端**
   ```bash
   cd manage_platform
   npm run build
   ```

2. **配置环境变量**
   ```env
   PORT=3002
   JWT_SECRET=your_strong_production_secret
   DB_PATH=./database.sqlite
   NODE_ENV=production
   ```

3. **启动服务**
   ```bash
   # 使用 PM2 管理进程
   npm install -g pm2
   pm2 start npm --name "easystay-backend" -- run start
   ```

4. **Nginx 配置**
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     
     location /api {
       proxy_pass http://localhost:3002;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
     
     location / {
       root /path/to/manage_platform/dist;
       index index.html;
       try_files $uri $uri/ /index.html;
     }
   }
   ```

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3002

CMD ["npm", "run", "start"]
```

## 常见问题

### Q1: 数据库连接失败？

**A**: 检查数据库文件路径和权限，确保 SQLite 驱动正常安装。

### Q2: JWT 认证失败？

**A**: 检查 JWT_SECRET 是否正确配置，确保 token 格式正确。

### Q3: API 接口返回 403？

**A**: 检查用户权限，确保具有访问该接口的权限。

### Q4: 如何添加新的 API 路由？

**A**: 
1. 在 `src/routes/` 下创建新的路由文件
2. 在 `app.js` 中注册路由
3. 实现相应的控制器逻辑

### Q5: 如何添加新的数据模型？

**A**: 
1. 在 `src/models/` 下创建新的模型文件
2. 在 `src/models/index.js` 中导出模型
3. 运行 `npm run seed` 重建数据库

## 开发指南

### 代码规范

- **文件命名**: 小驼峰式 (userModel.js)
- **函数命名**: 小驼峰式 (getUserById)
- **常量**: 大写下划线式 (MAX_PAGE_SIZE)
- **注释**: JSDoc 格式

### API 开发流程

1. **定义路由** - 在 `routes/` 中添加路由
2. **实现控制器** - 处理请求逻辑
3. **数据验证** - 验证请求参数
4. **数据库操作** - 使用 Sequelize 操作数据库
5. **响应处理** - 使用统一的响应格式

### 测试 API

使用 Postman 或 curl 测试 API：

```bash
# 登录获取 token
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123456"}'

# 使用 token 访问受保护的接口
curl -X GET http://localhost:3002/api/hotels \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 相关资源

- 📖 [Express 官方文档](https://expressjs.com/)
- 📚 [Sequelize 官方文档](https://sequelize.org/)
- 🔐 [JWT 官方文档](https://jwt.io/)
- 🗄️ [SQLite 官方文档](https://www.sqlite.org/)

## 更新日志

### v1.0.0 (2026-02-07)
- ✨ 初始版本发布
- ✨ 完成认证、酒店、订单等核心功能
- ✨ 集成 SQLite 数据库
- ✨ 实现 JWT 认证
- ✨ 优化 API 性能和安全性

---

**[⬆ 回到顶部](#easystay-后端-api)**

如有问题或建议，欢迎反馈！
