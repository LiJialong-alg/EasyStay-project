# EasyStay - 易宿酒店预订小程序

<div align="center">

[English](./README_EN.md) | 简体中文

一个功能完整的微信小程序酒店预订平台，提供酒店搜索、筛选、详情查看和订单管理等完整功能。

![微信小程序](https://img.shields.io/badge/WeChat-MiniProgram-09B7F7?style=flat-square)
![Node](https://img.shields.io/badge/Node-14+-green?style=flat-square)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)

</div>

## 📋 目录

- [项目简介](#项目简介)
- [功能特点](#功能特点)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [API 文档](#api-文档)
- [页面功能](#页面功能)
- [组件库](#组件库)
- [常见问题](#常见问题)
- [开发指南](#开发指南)
- [License](#license)

## 项目简介

**EasyStay** 是一个功能完整的微信小程序酒店预订平台。用户可以通过地理位置、日期、价格等多维度搜索和筛选酒店，查看酒店详情，进行订单预订和管理。项目采用现代化的开发方式，使用 MobX 进行状态管理，Vant UI 提供美观的组件库支持。

## 功能特点

### 核心功能
- ✅ **酒店搜索** - 支持关键词、城市、星级等多维度搜索
- ✅ **日期选择** - 集成日历组件，简化入住离店日期选择
- ✅ **价格筛选** - 按价格区间快速筛选酒店
- ✅ **智能排序** - 支持综合推荐、价格升序/降序排序
- ✅ **酒店详情** - 完整展示酒店信息、房型、配置等
- ✅ **订单管理** - 支持订单创建、查询、取消等
- ✅ **用户定位** - 自动获取用户位置，推荐附近酒店

### 用户体验
- 🎨 **美观界面** - 采用 Vant UI 组件库，设计简洁专业
- 📱 **响应式布局** - 完美适配各种屏幕尺寸
- ⚡ **快速加载** - 优化图片和资源，流畅的交互体验
- 🔄 **下拉刷新** - 支持列表下拉刷新和上拉加载
- 🌙 **自适应样式** - 支持浅色主题，视觉舒适

### 技术创新
- 📦 **状态管理** - 使用 MobX 进行全局状态管理
- 🔗 **API 抽象** - 统一的 HTTP 请求层封装
- 🎯 **组件封装** - 高复用性的自定义组件系统

## 技术栈

### 开发环境
- **语言**: JavaScript (CommonJS)
- **框架**: 微信小程序原生框架
- **小程序版本**: WeChat MiniProgram

### 核心依赖
```json
{
  "@vant/weapp": "^1.11.7",        // UI 组件库
  "mina-request": "^1.0.8",        // HTTP 请求库
  "mobx-miniprogram": "^6.12.3",   // 状态管理
  "mobx-miniprogram-bindings": "^5.1.1"  // MobX 绑定
}
```

### 开发工具推荐
- **编辑器**: VS Code
- **微信开发者工具**: 最新版本
- **Node.js**: 14+ 版本

## 项目结构

```
easystay-app/
├── miniprogram/                    # 小程序主目录
│   ├── app.js                     # 应用主程序
│   ├── app.json                   # 应用配置
│   ├── app.wxss                   # 全局样式
│   ├── sitemap.json               # 搜索引擎爬虫配置
│   │
│   ├── api/                       # API 接口层
│   │   ├── index.js              # 首页 API
│   │   ├── list.js               # 列表页 API
│   │   └── detail.js             # 详情页 API
│   │
│   ├── pages/                     # 页面目录
│   │   ├── index/                # 首页（推荐酒店）
│   │   │   ├── index.js
│   │   │   ├── index.json
│   │   │   ├── index.wxml
│   │   │   └── index.wxss
│   │   ├── list/                 # 搜索列表页
│   │   │   ├── list.js
│   │   │   ├── list.json
│   │   │   ├── list.wxml
│   │   │   └── list.wxss
│   │   ├── detail/               # 酒店详情页
│   │   │   ├── detail.js
│   │   │   ├── detail.json
│   │   │   ├── detail.wxml
│   │   │   └── detail.wxss
│   │   └── order/                # 订单页面
│   │       ├── order.js
│   │       ├── order.json
│   │       ├── order.wxml
│   │       └── order.wxss
│   │
│   ├── components/                # 自定义组件
│   │   ├── calendar/             # 日历选择组件
│   │   │   ├── calendar.js
│   │   │   ├── calendar.json
│   │   │   ├── calendar.wxml
│   │   │   └── calendar.wxss
│   │   ├── filterPicker/         # 筛选器组件
│   │   │   ├── filterPicker.js
│   │   │   ├── filterPicker.json
│   │   │   ├── filterPicker.wxml
│   │   │   └── filterPicker.wxss
│   │   └── hotel-item/           # 酒店卡片组件
│   │       ├── hotel-item.js
│   │       ├── hotel-item.json
│   │       ├── hotel-item.wxml
│   │       └── hotel-item.wxss
│   │
│   ├── store/                     # 数据仓库（MobX）
│   │   └── hotelAttrsStore.js    # 酒店属性全局状态
│   │
│   ├── utils/                     # 工具函数
│   │   ├── http.js               # HTTP 请求工具
│   │   ├── format.js             # 格式化工具
│   │   ├── storage.js            # 本地存储工具
│   │   ├── extendApi.js          # 扩展 API
│   │   └── env.js                # 环境配置
│   │
│   ├── images/                    # 静态资源
│   │   └── icons/                # 图标资源
│   │
│   └── miniprogram_npm/           # npm 依赖（编译后）
│       ├── @vant/weapp/          # Vant UI 组件库
│       ├── mina-request/         # 请求库
│       ├── mobx-miniprogram/     # MobX 核心
│       └── mobx-miniprogram-bindings/  # MobX 绑定
│
├── package.json                   # 项目配置
├── package-lock.json              # 依赖锁定文件
├── project.config.json            # 开发者工具配置
├── project.private.config.json    # 私密配置（本地）
│
└── README.md                      # 本文件
```

## 快速开始

### 1. 环境准备

确保你已安装：
- Node.js 14+ 
- npm 或 yarn
- 微信开发者工具

### 2. 克隆项目

```bash

```

### 3. 安装依赖

```bash
npm install
# 或
yarn install
```

### 4. 开发者工具配置

1. 打开微信开发者工具
2. 选择 `项目 > 新建项目`
3. 项目目录选择 `miniprogram` 文件夹
4. AppID 获取：[微信公众平台](https://mp.weixin.qq.com/)
5. 选择项目根目录的 `project.config.json`

### 5. 开发与调试

- **编译预览**: 在微信开发者工具中点击 `预览`
- **真机调试**: 扫二维码在手机上调试
- **控制台查看**: 使用微信开发者工具的 `Console` 查看日志

## 配置说明

### 环境变量 (.env.example)

复制 `.env.example` 为 `.env`，配置如下参数：

```env
# API 服务器地址
VUE_APP_API_BASE_URL=https://api.easystay.com

# 微信 AppID
WECHAT_APP_ID=your_app_id_here

# 微信 AppSecret
WECHAT_APP_SECRET=your_app_secret_here
```

### project.config.json 关键配置

```json
{
  "appid": "你的AppID",
  "projectname": "EasyStay",
  "libVersion": "2.30.0",           // 基础库版本
  "compileType": "miniprogram",
  "debugOptions": {
    "hidedInDevtools": []
  }
}
```

## API 文档

### 1. 首页 API (`api/index.js`)

```javascript
// 获取推荐酒店列表
reqRecHotels()
// 返回: { code: 200, data: [...], message: "success" }
```

### 2. 列表页 API (`api/list.js`)

```javascript
// 搜索酒店
reqSearchHotels(params)
// 参数：{ keyword, city, district, startDate, endDate, page, limit, sort }
// 返回：{ code: 200, data: [...], pagination: { total, page, limit } }
```

### 3. 详情页 API (`api/detail.js`)

```javascript
// 获取酒店详情
reqHotelDetail(id)
// 参数：酒店 ID
// 返回：{ code: 200, data: { ...hotelInfo }, message: "success" }
```

## 页面功能

### 📍 首页 (`pages/index`)

**功能**:
- 轮播图展示精选酒店
- 位置选择（城市、地区）
- 日期范围选择（入住、离店）
- 酒店搜索和快速标签
- 推荐酒店列表展示

**关键交互**:
- `onStartDateTap()` - 打开日期选择器
- `onSearch()` - 执行搜索
- `onQuickTag()` - 快速筛选标签

### 🔍 搜索列表 (`pages/list`)

**功能**:
- 固定搜索头部
- 多条件筛选（城市、日期、价格）
- 多种排序方式（综合、价格升序/降序）
- 无限滚动加载
- 下拉刷新功能
- 骨架屏加载态

**关键交互**:
- `onSearch()` - 执行搜索
- `onSortChange()` - 改变排序方式
- `onReachBottom()` - 滚动到底部加载更多
- `onPullDownRefresh()` - 下拉刷新

### 🏨 酒店详情 (`pages/detail`)

**功能**:
- 酒店完整信息展示
- 房型和价格列表
- 用户评价和评分
- 酒店设施和服务展示
- 预订按钮

**关键方法**:
- `loadHotelDetail()` - 加载酒店详情
- `onBooking()` - 预订酒店

### 📦 订单管理 (`pages/order`)

**功能**:
- 订单列表展示
- 订单详情查看
- 订单取消功能
- 订单状态追踪

## 组件库

### 🎨 Vant UI 组件

项目集成了 Vant WeApp 组件库，主要使用的组件：

| 组件名        | 功能       | 使用页面       |
| ------------- | ---------- | -------------- |
| `van-cell`    | 列表单元格 | 所有页面       |
| `van-button`  | 按钮       | 搜索、预订     |
| `van-popup`   | 弹窗       | 日期/价格筛选  |
| `van-picker`  | 选择器     | 日期、价格范围 |
| `van-loading` | 加载动画   | 数据加载中     |
| `van-empty`   | 空状态     | 无数据时显示   |
| `van-tag`     | 标签       | 快速搜索标签   |

### 🔧 自定义组件

#### 1. Calendar 日历组件 (`components/calendar/`)

```html
<!-- 使用方式 -->
<calendar 
  wx:if="{{ showCalendar }}" 
  bind:close="onCalendarClose"
/>
```

**功能**:
- 展示3个月日历
- 支持日期范围选择
- 标记入住/离店日期
- 选择状态高亮显示

**事件**:
- `close` - 确认选择触发

#### 2. FilterPicker 筛选器 (`components/filterPicker/`)

```html
<!-- 使用方式 -->
<filterPicker 
  bind:filterChange="onFilterChange"
/>
```

**功能**:
- 价格范围选择
- 星级筛选
- 多条件组合筛选

**事件**:
- `filterChange` - 筛选条件改变触发

#### 3. HotelItem 酒店卡片 (`components/hotel-item/`)

```html
<!-- 使用方式 -->
<hotelCard 
  item="{{ hotelData }}"
  bind:tap="onHotelTap"
/>
```

**功能**:
- 展示酒店基本信息
- 显示价格和评分
- 图片懒加载

## 状态管理

### MobX Store (`store/hotelAttrsStore.js`)

使用 MobX 进行全局状态管理，存储搜索条件：

```javascript
// 存储结构
hotelAttrs: {
  keyword: '',        // 搜索关键词
  city: '',          // 城市
  district: '',      // 地区
  startDate: '',     // 入住日期
  endDate: '',       // 离店日期
  starRating: '',    // 星级评分
  minPrice: '',      // 最低价格
  maxPrice: ''       // 最高价格
}

// 使用示例
hotelAttrsStore.setHotelAttrs({ 
  city: '北京', 
  district: '朝阳区' 
})
```

## HTTP 请求工具 (`utils/http.js`)

统一的请求层封装，支持：
- 自动错误处理
- 请求/响应拦截
- 超时控制
- 错误重试

```javascript
import http from '../utils/http'

// GET 请求
http.get('/hotels/list', { page: 1 })

// POST 请求
http.post('/orders', { hotelId: 123 })
```

## 常见问题

### Q1: 日历组件在列表页显示不出来？

**A**: 这是一个已知的 CSS z-index 问题。列表页的固定头部 `z-index: 100` 遮挡了日历组件。

**解决方案**:
- 给日历组件设置更高的 `z-index: 1000`
- 或在日历组件容器外层处理样式

### Q2: 如何修改 API 服务器地址？

**A**: 修改 `miniprogram/utils/http.js` 中的 `BASE_URL`:

```javascript
const BASE_URL = 'https://your-api-server.com'
```

### Q3: 如何添加新的页面？

**A**:
1. 在 `miniprogram/pages/` 下创建新目录
2. 创建 `pageName.js`, `pageName.json`, `pageName.wxml`, `pageName.wxss`
3. 在 `app.json` 的 `pages` 数组中添加路径

### Q4: 如何自定义主题颜色？

**A**: 修改各页面的 `.wxss` 文件或全局 `app.wxss`:

```css
page {
  --primary-blue: #0086F6;  /* 修改主色 */
}
```

### Q5: 本地存储如何使用？

**A**: 使用提供的 `utils/storage.js` 工具:

```javascript
import storage from '../utils/storage'

storage.setItem('key', value)
storage.getItem('key')
storage.removeItem('key')
```

## 开发指南

### 代码规范

#### 命名规范
- **文件名**: 小驼峰式 (hotelList.js)
- **组件名**: 短横线式 (hotel-item)
- **变量/函数**: 小驼峰式 (getHotelInfo)
- **常量**: 大写下划线式 (MAX_RETRY_COUNT)

#### 注释规范
```javascript
/**
 * 获取酒店列表
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @returns {Promise} 酒店列表数据
 */
async function getHotels(page, limit) {
  // 实现代码
}
```

### 调试技巧

#### 1. 使用控制台打印
```javascript
console.log('[HotelList] Loading data...')
console.warn('[Warning] Invalid price range')
console.error('[Error] API request failed')
```

#### 2. 使用微信开发者工具调试
- 打开 `Console` 查看日志
- 使用 `Debugger` 设置断点
- 查看 `Network` 标签检查 API 请求

#### 3. 使用存储检查
```javascript
// 查看本地存储
wx.getStorage({
  key: 'user_info',
  success: (res) => console.log(res.data)
})
```

### 测试数据

#### 模拟酒店数据
```javascript
const mockHotel = {
  id: 1,
  name: '五星级豪华酒店',
  city: '北京',
  district: '朝阳区',
  price: 500,
  rating: 4.8,
  reviews: 1000,
  images: ['url1', 'url2'],
  facilities: ['WiFi', '停车场', '健身房']
}
```

### 性能优化

1. **图片优化**
   - 使用适当尺寸的图片
   - 启用懒加载
   - 压缩图片体积

2. **数据优化**
   - 分页加载数据
   - 缓存已加载数据
   - 避免重复请求

3. **组件优化**
   - 使用虚拟列表长列表
   - 减少页面层级
   - 及时销毁不需要的组件

## 部署指南

### 微信小程序上线流程

1. **开发测试**
   - 完成功能开发
   - 在开发版本充分测试

2. **提交审核**
   - 微信开发者工具 > 上传
   - 登录微信公众平台后台审核

3. **发布上线**
   - 审核通过后点击发布
   - 小程序上线

4. **监控运维**
   - 监控错误日志
   - 跟踪用户反馈
   - 及时修复问题

## 贡献指南

欢迎提交 Pull Request 或 Issue！

### 提交流程
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 相关资源

- 📖 [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- 🎨 [Vant WeApp 官方文档](https://github.com/youzan/vant-weapp)
- 🔗 [MobX 官方文档](https://mobx.js.org/)
- 📱 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

## 更新日志

### v1.0.0 (2026-02-07)
- ✨ 初始版本发布
- ✨ 完成酒店搜索和筛选功能
- ✨ 实现日期选择和价格筛选
- ✨ 添加用户定位功能
- ✨ 完善订单管理系统

## License

本项目采用 ISC License - 详见 [LICENSE](LICENSE) 文件

---

<div align="center">

**[⬆ 回到顶部](#easystay---易宿酒店预订小程序)**

如有问题或建议，欢迎通过 [Issues](https://github.com/LiJialong-alg/EasyStay-app/issues) 反馈

Made with ❤️ by [LiJialong-alg](https://github.com/LiJialong-alg)

</div>
