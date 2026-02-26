# EasyStay - 酒店管理平台

一个完整的全栈酒店管理解决方案，包含商家管理端、平台管理端和用户预订小程序。

## 😍 快速开始

### 前置条件
- **Node.js** >= 18（推荐 v20 LTS）
- **npm** >= 9

### 三步启动

```bash
# 1. 安装所有依赖
npm run install:all

# 2. 初始化数据库和演示数据
npm run seed

# 3. 启动后端和前端服务
npm run dev
```

启动完成后访问：
- 📱 **管理平台**: http://localhost:5173
- 🔌 **后端 API**: http://localhost:3002

## 📁 项目结构

```
.
├── nodejs_backend/          # 后端 API (Node.js + Express + SQLite)
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── models/         # 数据模型
│   │   ├── seed/           # 初始化脚本
│   │   └── app.js          # 应用入口
│   └── package.json
│
├── manage_platform/         # 前端管理系统 (React + Vite + Ant Design)
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务
│   │   └── components/     # 公共组件
│   └── package.json
│
├── mini_app/                # 用户预订小程序 (WeChat MiniProgram)
│   ├── miniprogram/
│   │   ├── pages/          # 小程序页面
│   │   ├── components/     # 小程序组件
│   │   └── api/            # API 调用
│   └── package.json
│
└── documents/               # 项目文档（设计、架构、需求等）
```

## 🏗️ 技术栈概览

### 后端
- **框架**: Express.js v5 + Node.js
- **数据库**: SQLite + Sequelize ORM
- **认证**: JWT
- **详细文档**: 见 [nodejs_backend/README.md](nodejs_backend/README.md)

### 管理平台
- **框架**: React 19 + Vite
- **UI**: Ant Design v6
- **状态管理**: Redux Toolkit
- **路由**: React Router v7
- **图表**: ECharts
- **详细文档**: 见 [manage_platform/README.md](manage_platform/README.md)

### 预订小程序
- **平台**: 微信小程序
- **UI**: Vant WeApp
- **状态管理**: MobX
- **详细文档**: 见 [mini_app/README.md](mini_app/README.md)

## 📋 功能概览

### 商家管理端
- 数据看板（营收、订单、入住率等）
- 酒店与房型管理
- 房态日历和批量改价
- 订单管理和处理
- 财务统计和提现
- 评价管理和回复

### 平台管理员
- 平台数据监控
- 商家审核和管理
- 财务审核
- 系统公告和 Banner 管理

### 用户小程序
- 酒店搜索和筛选
- 酒店详情查看
- 订单预订和管理
- 用户定位推荐

## 🔑 默认账号

```
管理员账号：admin / 123456
商家账号：merchant / 123456
```

## 📚 详细文档

- **后端**：[nodejs_backend/README.md](nodejs_backend/README.md) - API 接口、数据模型、配置说明
- **管理平台**：[manage_platform/README.md](manage_platform/README.md) - 组件、页面、状态管理
- **小程序**：[mini_app/README.md](mini_app/README.md) - 小程序配置、页面功能、API

## 🆘 常见问题

**Q: 如何手动在各目录执行命令？**
```bash
# 后端
cd nodejs_backend && npm install && npm run seed && npm run dev

# 管理平台
cd manage_platform && npm install && npm run dev
```

**Q: 想修改后端服务端口？**
1. 编辑 `nodejs_backend/.env`，修改 `PORT=xxxx`
2. 编辑 `manage_platform/vite.config.js` 中的代理配置

**Q: 如何重置数据库？**
```bash
cd nodejs_backend
rm database.sqlite
npm run seed
```

**Q: 生产环境部署？**
```bash
# 构建前端
cd manage_platform && npm run build
# 构建产物在 dist/ 目录，可配合后端服务静态托管

# 后端可用 Node 或 PM2 等方案部署
```
