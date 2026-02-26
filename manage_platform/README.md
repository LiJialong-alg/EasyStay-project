# EasyStay 管理平台

## 📋 目录

- [项目简介](#项目简介)
- [功能特点](#功能特点)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [页面功能](#页面功能)
- [API 服务](#api-服务)
- [状态管理](#状态管理)
- [常见问题](#常见问题)
- [开发指南](#开发指南)

## 项目简介

**EasyStay 管理平台** 是一个基于 React + Ant Design 构建的现代化酒店管理系统，为酒店商家和平台管理员提供完整的管理功能。系统支持酒店管理、订单处理、财务管理、数据分析等核心功能。

## 功能特点

### 商家管理端
- 📊 **数据看板** - 实时展示酒店营收、订单、入住率等关键指标
- 🏨 **酒店管理** - 酒店信息管理、房型配置、房态管理
- 📅 **房态日历** - 直观的房态管理和批量价格调整
- 📝 **订单管理** - 订单列表、详情、状态流转、接单设置
- 💰 **财务管理** - 营收统计、流水明细、提现申请
- ⭐ **评价管理** - 查看和回复用户评价
- 📢 **营销管理** - 活动创建和管理

### 平台管理员
- 📈 **平台监控** - 全局数据统计和分析
- 👥 **商家管理** - 商家审核、管理和权限控制
- 🔍 **内容审核** - 酒店注册和列表审核
- 💰 **财务审核** - 提现申请审核和财务监控
- 📣 **系统管理** - 公告发布、Banner 管理

## 技术栈

### 核心技术
- **框架**: React 19 + Vite 6
- **UI 库**: Ant Design v6
- **状态管理**: Redux Toolkit
- **路由**: React Router v7
- **图表**: ECharts + echarts-for-react
- **HTTP 客户端**: Axios
- **构建工具**: Vite

### 开发依赖
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "antd": "^6.0.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "react-router-dom": "^7.0.0",
    "axios": "^1.0.0",
    "echarts": "^5.0.0",
    "echarts-for-react": "^3.0.0",
    "dayjs": "^1.0.0"
  }
}
```

## 项目结构

```
manage_platform/
├── public/                  # 静态资源
├── src/
│   ├── assets/             # 图片、图标等资源
│   ├── components/         # 公共组件
│   │   ├── AuthBootstrap.jsx      # 认证相关组件
│   │   ├── Captcha.jsx            # 验证码组件
│   │   └── ProtectedRoute.jsx     # 路由守卫
│   │
│   ├── layout/             # 布局组件
│   │   ├── AdminLayout.jsx        # 管理员布局
│   │   ├── AuthLayout.jsx         # 认证页面布局
│   │   └── MerchantLayout.jsx     # 商家布局
│   │
│   ├── pages/              # 页面组件
│   │   ├── auth/           # 认证相关页面
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── admin/          # 管理员页面
│   │   │   ├── Dashboard.jsx
│   │   │   ├── analytics/         # 数据分析
│   │   │   ├── finance/           # 财务管理
│   │   │   ├── hotel/             # 酒店管理
│   │   │   ├── merchant/          # 商家管理
│   │   │   ├── risk/              # 风险控制
│   │   │   └── system/            # 系统设置
│   │   │
│   │   └── merchant/       # 商家页面
│   │       ├── Dashboard.jsx
│   │       ├── Analytics.jsx
│   │       ├── FinanceManagement.jsx
│   │       ├── HotelInfo.jsx
│   │       ├── Marketing.jsx
│   │       ├── OrderManagement.jsx
│   │       ├── Reviews.jsx
│   │       ├── marketing/         # 营销管理
│   │       ├── order/             # 订单管理
│   │       └── room/              # 房型管理
│   │
│   ├── services/           # API 服务
│   │   ├── authService.js         # 认证服务
│   │   ├── hotelService.js        # 酒店服务
│   │   ├── orderService.js        # 订单服务
│   │   ├── financeService.js      # 财务服务
│   │   └── ...                    # 其他服务
│   │
│   ├── store/              # Redux 状态管理
│   │   ├── index.js               # Store 配置
│   │   └── userSlice.js           # 用户状态
│   │
│   ├── utils/              # 工具函数
│   │   ├── request.js             # HTTP 请求封装
│   │   └── mockData.js            # 模拟数据
│   │
│   ├── styles/             # 全局样式
│   ├── App.jsx             # 应用入口
│   ├── main.jsx            # 渲染入口
│   └── index.css           # 全局样式
├── .gitignore              # Git 忽略文件
├── eslint.config.js        # ESLint 配置
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── package-lock.json       # 依赖锁定
└── vite.config.js          # Vite 配置
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
cd manage_platform
npm install
```

### 3. 启动开发服务器

```bash
# 在项目根目录执行
npm run dev

# 或单独在本目录执行
cd manage_platform
npm run dev
```

### 4. 访问系统

启动后访问：http://localhost:5173

## 配置说明

### 代理配置 (vite.config.js)

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  }
})
```

### API 基础路径

所有 API 请求通过 `/api` 前缀代理到后端服务。

## 页面功能

### 🔐 认证页面

#### 登录页 (`pages/auth/Login.jsx`)
- 支持账号密码登录
- 验证码验证
- 记住密码功能
- 权限控制（管理员/商家）

#### 注册页 (`pages/auth/Register.jsx`)
- 商家注册
- 信息验证
- 注册流程引导

### 👑 管理员页面

#### 数据看板 (`pages/admin/Dashboard.jsx`)
- 平台概览数据
- 关键指标图表
- 最近活动

#### 酒店管理
- **酒店列表** - 查看和管理所有酒店
- **酒店注册审核** - 审核新酒店注册
- **酒店列表审核** - 审核酒店上线
- **订单管理** - 查看所有订单

#### 商家管理
- **商家列表** - 查看和管理商家账号
- **商家审核** - 审核商家资质

#### 财务管理
- **平台报表** - 平台营收统计
- **提现审核** - 审核商家提现申请

#### 系统管理
- **公告管理** - 发布和管理系统公告
- **Banner 管理** - 管理首页 Banner

### 🏪 商家页面

#### 数据看板 (`pages/merchant/Dashboard.jsx`)
- 酒店运营概览
- 营收趋势图表
- 订单统计

#### 酒店信息 (`pages/merchant/HotelInfo.jsx`)
- 酒店基本信息管理
- 图片上传和管理
- 设施和服务配置

#### 订单管理 (`pages/merchant/OrderManagement.jsx`)
- 订单列表和详情
- 订单状态处理
- 接单设置

#### 房态管理
- **房态日历** - 实时房态查看
- **价格调整** - 批量价格设置

#### 财务管理 (`pages/merchant/FinanceManagement.jsx`)
- 营收统计
- 流水明细
- 提现申请

#### 评价管理 (`pages/merchant/Reviews.jsx`)
- 查看用户评价
- 回复评价
- 评价统计

#### 营销管理 (`pages/merchant/Marketing.jsx`)
- 活动创建和管理
- 促销设置

## API 服务

### 核心服务

#### 认证服务 (`services/authService.js`)
- `login(username, password)` - 用户登录
- `register(data)` - 用户注册
- `getCurrentUser()` - 获取当前用户信息

#### 酒店服务 (`services/hotelService.js`)
- `getHotels(params)` - 获取酒店列表
- `getHotelDetail(id)` - 获取酒店详情
- `createHotel(data)` - 创建酒店
- `updateHotel(id, data)` - 更新酒店信息

#### 订单服务 (`services/orderService.js`)
- `getOrders(params)` - 获取订单列表
- `getOrderDetail(id)` - 获取订单详情
- `updateOrderStatus(id, status)` - 更新订单状态

#### 财务服务 (`services/financeService.js`)
- `getFinanceSummary()` - 获取财务汇总
- `getTransactions()` - 获取交易明细
- `createWithdrawal(data)` - 创建提现申请

## 状态管理

### Redux Store

使用 Redux Toolkit 管理全局状态：

```javascript
// store/userSlice.js
import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token')
  },
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem('token', action.payload.token)
    },
    logout: (state) => {
      state.currentUser = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    }
  }
})
```

### 使用示例

```javascript
import { useDispatch, useSelector } from 'react-redux'
import { setUser, logout } from '../store/userSlice'

// 获取用户状态
const { currentUser, isAuthenticated } = useSelector(state => state.user)

// 登录
const dispatch = useDispatch()
dispatch(setUser({ user: userData, token: token }))

// 登出
dispatch(logout())
```

## 路由管理

### 路由配置

```javascript
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layout/AdminLayout'
import MerchantLayout from './layout/MerchantLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 管理员路由 */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="hotels" element={<HotelList />} />
            {/* 其他管理员路由 */}
          </Route>
        </Route>
        
        {/* 商家路由 */}
        <Route element={<ProtectedRoute role="merchant" />}>
          <Route path="/merchant" element={<MerchantLayout />}>
            <Route index element={<MerchantDashboard />} />
            <Route path="hotel-info" element={<HotelInfo />} />
            {/* 其他商家路由 */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

## 常见问题

### Q1: 登录后无法访问管理页面？

**A**: 检查是否有正确的权限角色。管理员需要 `admin` 角色，商家需要 `merchant` 角色。

### Q2: 如何修改 API 基础地址？

**A**: 修改 `vite.config.js` 中的代理配置：

```javascript
proxy: {
  '/api': {
    target: 'http://your-api-server.com',
    changeOrigin: true
  }
}
```

### Q3: 页面加载缓慢？

**A**: 检查网络连接和后端服务状态，或优化前端代码：
- 使用组件懒加载
- 优化图片大小
- 减少不必要的 API 请求

### Q4: 如何添加新页面？

**A**: 
1. 在 `src/pages/` 下创建新页面组件
2. 在 `App.jsx` 中添加路由
3. 如需权限控制，使用 `ProtectedRoute` 组件

## 开发指南

### 代码规范

- **文件命名**: 大驼峰式 (HotelList.jsx)
- **组件命名**: 大驼峰式 (HotelCard)
- **变量/函数**: 小驼峰式 (getHotelInfo)
- **常量**: 大写下划线式 (MAX_PAGE_SIZE)

### 组件开发

```jsx
// 示例组件
import React, { useState, useEffect } from 'react'
import { Card, Button, message } from 'antd'

const HotelCard = ({ hotel }) => {
  const [loading, setLoading] = useState(false)

  const handleViewDetail = () => {
    setLoading(true)
    // 模拟 API 调用
    setTimeout(() => {
      message.success('查看详情')
      setLoading(false)
    }, 1000)
  }

  return (
    <Card 
      title={hotel.name} 
      extra={<Button loading={loading} onClick={handleViewDetail}>查看</Button>}
    >
      <p>城市: {hotel.city}</p>
      <p>价格: ¥{hotel.price}/晚</p>
      <p>评分: {hotel.rating}</p>
    </Card>
  )
}

export default HotelCard
```

### API 调用

```javascript
// 使用封装的 request 工具
import request from '../utils/request'

// GET 请求
const getHotels = async (params) => {
  const response = await request.get('/hotels', { params })
  return response.data
}

// POST 请求
const createOrder = async (orderData) => {
  const response = await request.post('/orders', orderData)
  return response.data
}
```

### 调试技巧

1. **使用 React DevTools** - 查看组件状态和props
2. **使用 Redux DevTools** - 监控状态变化
3. **控制台日志** - 使用 `console.log` 调试
4. **网络请求** - 检查浏览器 Network 标签

## 构建与部署

### 构建生产版本

```bash
# 在 manage_platform 目录执行
npm run build
```

构建产物将生成在 `dist` 目录。

### 部署方案

1. **静态部署** - 将 `dist` 目录部署到 Nginx、Apache 等静态服务器
2. **集成部署** - 将构建产物复制到后端 `public` 目录，由后端服务托管
3. **容器化部署** - 使用 Docker 容器化部署

## 相关资源

- 📖 [React 官方文档](https://react.dev/)
- 🎨 [Ant Design 官方文档](https://ant.design/)
- 🔗 [Redux Toolkit 官方文档](https://redux-toolkit.js.org/)
- 📡 [Axios 官方文档](https://axios-http.com/)
- 📊 [ECharts 官方文档](https://echarts.apache.org/)

## 更新日志

### v1.0.0 (2026-02-07)
- ✨ 初始版本发布
- ✨ 完成管理员和商家管理功能
- ✨ 实现酒店和订单管理
- ✨ 集成数据分析和图表
- ✨ 优化用户界面和体验

---

**[⬆ 回到顶部](#easystay-管理平台)**

如有问题或建议，欢迎反馈！