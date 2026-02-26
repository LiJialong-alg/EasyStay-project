# 酒店管理系统开发文档 (Merchant Management System)

## 1. 系统架构概述
本系统采用前后端分离架构，旨在为酒店商家提供一站式的房态管理、订单处理、财务统计及营销工具。

*   **前端**: React + Vite + Ant Design + ECharts
*   **后端**: Node.js + Express + Sequelize (SQLite)
*   **认证**: JWT (JSON Web Tokens) - *[待完善]*

---

## 2. 目录结构
### 前端 (`/src`)
*   **pages/**: 页面组件
    *   `merchant/Dashboard.jsx`: 首页看板 (核心指标、图表、日程)
    *   `merchant/order/OrderManagement.jsx`: 订单列表与处理
    *   `merchant/room/RoomStatusCalendar.jsx`: 房态日历 (每日开关房、改价)
    *   `merchant/room/RoomTypeSetup.jsx`: 房型设置 (上下线、默认价)
    *   `merchant/FinanceManagement.jsx`: 财务报表
    *   `merchant/Reviews.jsx`: 评价管理
    *   `merchant/Analytics.jsx`: 数据中心
*   **services/**: API 请求封装 (Axios)
    *   `dashboardService.js`: 看板数据、日程
    *   `hotelService.js`: 酒店、房型信息
    *   `orderService.js`: 订单查询与操作
    *   `roomService.js`: 房态日历操作
    *   `financeService.js`: 财务流水
    *   `reviewService.js`: 评价回复
*   **layout/**: 布局组件 (`MerchantLayout.jsx`)

### 后端 (`server/src`)
*   **routes/**: API 路由定义
    *   `dashboard.js`: `/stats`, `/chart/revenue`, `/schedules`
    *   `orders.js`: `/orders` (CRUD)
    *   `rooms.js`: `/rooms/calendar`, `/rooms/price/batch-update`
    *   `hotels.js`: `/hotels`, `/hotels/room-types/:id`
    *   `finance.js`: `/finance/summary`, `/finance/transactions`
    *   `reviews.js`: `/reviews`
*   **models/**: Sequelize 数据模型
    *   `User`, `Hotel`, `RoomType`, `RoomDailyInventory`
    *   `Order`, `Transaction`, `Review`, `Schedule`
*   **config/**: 数据库连接 (`db.js`)
*   **seed/**: 模拟数据脚本 (`seed.js`)

---

## 3. 核心功能模块与接口对照

### 3.1 首页看板 (Dashboard)
*   **功能**: 展示今日营收、浏览量、入住率、待处理订单数；展示营收趋势图；管理待办事项和日程。
*   **接口**:
    *   `GET /api/dashboard/stats`: 获取4个核心指标（**已修复**: 待处理订单数与列表同步）。
    *   `GET /api/dashboard/chart/revenue?period={week|month|year}`: 获取营收趋势图数据。
    *   `GET /api/dashboard/schedules`: 获取日程列表。
    *   `POST /api/dashboard/schedules`: 新增日程。
    *   `PUT /api/dashboard/schedules/:id`: 修改日程。
    *   `DELETE /api/dashboard/schedules/:id`: 删除日程。

### 3.2 订单管理 (Order Management)
*   **功能**: 查询订单列表、筛选状态、办理入住/退房/取消。
*   **接口**:
    *   `GET /api/orders`: 支持分页 (`page`, `pageSize`) 和状态筛选 (`status`)。
    *   `GET /api/orders/:id`: 详情。
    *   `PATCH /api/orders/:id/status`: 变更状态 (如 `pending` -> `confirmed`)。

### 3.3 房态管理 (Room Status)
*   **功能**: 
    *   **房态日历**: 查看每日库存、价格、开关房状态。
    *   **批量改价**: 选中日期范围修改价格、库存和状态。
    *   **房型设置**: 上下线房型、修改默认基准价。
*   **接口**:
    *   `GET /api/rooms/calendar`: 获取指定日期范围的每日房态。
    *   `POST /api/rooms/price/batch-update`: 批量更新每日房态（支持价格、库存、状态）。
    *   `PATCH /api/hotels/room-types/:id`: 修改房型默认价格 (`base_price`)。
    *   `PATCH /api/rooms/:id/status`: 修改房型上下线状态 (API逻辑复用)。

### 3.4 财务管理 (Finance)
*   **功能**: 查看月度收支汇总、交易流水明细。
*   **接口**:
    *   `GET /api/finance/summary`: 计算本月收入、待结算、提现、余额。
    *   `GET /api/finance/transactions`: 分页获取流水列表，支持类型/状态筛选。

### 3.5 评价管理 (Reviews)
*   **功能**: 查看用户评价、回复评价、置顶优质评价。
*   **接口**:
    *   `GET /api/reviews`: 获取评价列表。
    *   `PATCH /api/reviews/:id/reply`: 商家回复。
    *   `PATCH /api/reviews/:id/highlight`: 切换置顶状态。

### 3.6 数据中心 (Analytics)
*   **功能**: 展示用户画像（性别、年龄）、来源地、预订习惯等10大图表。
*   **接口**:
    *   `GET /api/analytics/overview`: 获取所有图表所需的聚合数据。

---

## 4. 数据库设计 (Schema)
*   **Hotels**: 酒店基础信息 (name, address, status, owner_id)
*   **RoomTypes**: 房型定义 (name, base_price, total_stock, status)
*   **RoomDailyInventories**: 每日房态快照 (date, price, available_stock, status)
*   **Orders**: 订单 (customer_name, check_in/out, total_amount, status)
*   **Transactions**: 资金流水 (amount, type: income/refund/withdrawal, status)
*   **Reviews**: 评价 (rating, content, reply, is_highlight)
*   **Schedules**: 商家日程 (event_content, event_time, type)

## 5. 开发规范与注意事项
1.  **前端组件库**: 严格使用 Ant Design v5 组件，遵循其 Design Token 规范。
2.  **图表库**: 仅使用 `echarts-for-react` 组件，**禁止**直接 `import * as echarts` 以避免构建错误。
3.  **状态管理**: 目前使用 React `useState` + `useEffect`，复杂状态建议引入 Context 或 Redux。
4.  **API 路径**: 所有后端路由挂载在 `/api` 前缀下。
5.  **Mock 数据**: `server/src/seed/seed.js` 可用于重置和生成测试数据。

---
*文档生成时间: 2026-02-12*
