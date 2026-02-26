# 酒店预订平台 - 技术架构文档 (Technical Architecture)

## 1. 系统架构概览

本系统采用前后端分离架构，前端为单页应用 (SPA)，后端基于 Supabase (BaaS) 提供数据服务。系统逻辑上分为“商家端”和“平台管理端”两个子系统，通过路由和权限控制进行隔离。

```mermaid
graph TD
    A[用户浏览器] --> B[React 前端应用]
    B --> C[Supabase Client SDK]
    
    subgraph "前端应用 (Single Page App)"
        B1[商家端模块 /merchant/*]
        B2[管理端模块 /admin/*]
        B3[公共组件库]
    end

    subgraph "后端服务 (Supabase)"
        D[PostgreSQL 数据库]
        E[Auth 认证服务]
        F[Storage 存储服务]
        G[Edge Functions (可选业务逻辑)]
    end

    C --> E
    C --> D
    C --> F

    style A fill:#1a1a1a,stroke:#4a90e2,stroke-width:2px,color:#fff
    style B fill:#4a90e2,stroke:#357abd,stroke-width:2px,color:#fff
    style D fill:#22c55e,stroke:#16a34a,stroke-width:2px,color:#fff
```

## 2. 技术栈详情

-   **前端框架**: React 18 + Vite
-   **语言**: JavaScript / TypeScript (建议迁移至 TS)
-   **UI 组件库**: Ant Design 5.x (企业级后台首选)
-   **样式方案**: Tailwind CSS (用于布局和微调) + CSS Variables (主题定制)
-   **状态管理**: Redux Toolkit (全局用户状态) + React Query (服务端数据状态)
-   **图表库**: ECharts (数据大屏)
-   **后端服务**: Supabase (PostgreSQL, Auth, Storage)
-   **HTTP 客户端**: Axios (统一拦截器处理)

## 3. 目录结构规范

```text
root/
├── front/                  # 前端项目根目录
│   ├── src/
│   │   ├── pages/
│   │   │   ├── merchant/   # 商家端页面
│   │   │   └── admin/      # 管理端页面
│   │   ├── components/     # 公共组件
│   │   ├── layout/         # 布局组件 (MerchantLayout, AdminLayout)
│   │   ├── services/       # API 请求封装
│   │   ├── store/          # Redux 状态
│   │   └── styles/         # 全局样式与主题变量
│   └── ...
└── backend/                # 后端/云函数目录 (如使用 Node.js 中间层)
```

## 4. 路由与权限设计

系统通过 React Router v6 实现路由跳转，并结合高阶组件 (HOC) `ProtectedRoute` 实现权限守卫。

| 路由前缀 | 适用角色 | 描述 |
|----------|----------|------|
| `/login` | 所有用户 | 统一登录入口，登录后根据角色重定向 |
| `/merchant/*` | `merchant` | **商家端**：仅限入驻商户访问 |
| `/admin/*` | `admin` | **管理端**：仅限平台管理员访问 |

**重定向逻辑**:
-   若用户角色为 `merchant` 且访问 `/admin` -> 拦截并跳转至 `/merchant/dashboard`。
-   若用户角色为 `admin` 且访问 `/merchant` -> 拦截并跳转至 `/admin/dashboard`。

## 5. 数据库模型 (Schema)

核心表结构设计如下：

### 5.1 用户与认证 (Users)
-   `id`: UUID, 主键
-   `email`: 账号邮箱
-   `role`: 角色枚举 (`admin`, `merchant`, `user`)
-   `status`: 账号状态 (`active`, `banned`)

### 5.2 酒店 (Hotels)
-   `id`: UUID
-   `merchant_id`: 关联 Users 表
-   `name`: 酒店名称
-   `status`: 营业状态 (`operating`, `closed`, `audit_pending`)
-   `audit_status`: 审核状态

### 5.3 房型 (RoomTypes)
-   `id`: UUID
-   `hotel_id`: 关联 Hotels 表
-   `name`: 房型名称
-   `base_price`: 基准价格
-   `total_stock`: 总库存量

### 5.4 每日房态 (RoomDailyInventories)
-   `id`: UUID
-   `room_type_id`: 关联 RoomTypes
-   `date`: 日期
-   `price`: 当日价格 (覆盖基准价)
-   `stock`: 当日剩余库存
-   `status`: 当日开关房状态

### 5.5 订单 (Orders)
-   `id`: UUID
-   `hotel_id`: 关联 Hotels
-   `user_id`: 下单用户 (C端)
-   `status`: 订单状态 (`pending`, `confirmed`, `checked_in`, `completed`, `cancelled`)
-   `total_amount`: 订单总额
-   `commission`: 平台佣金

## 6. 安全与性能

### 6.1 安全策略
-   **RLS (Row Level Security)**: 在数据库层严格限制访问权限。
    -   商家只能查询 `merchant_id` 等于自己的酒店和订单。
    -   管理员可查询所有数据。
-   **HTTPS**: 全站强制加密传输。
-   **Input Validation**: 前后端双重校验，防止 XSS 和 SQL 注入。

### 6.2 性能优化
-   **代码分割**: 对 `/merchant` 和 `/admin` 路由进行懒加载 (Lazy Loading)，减少首屏体积。
-   **静态资源缓存**: 配置长期缓存策略。
-   **API 聚合**: 尽量减少 HTTP 请求次数，关键页面数据并行请求。
