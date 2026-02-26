**总体架构**
- 前后端分离：前端（Vite）通过 axios 以 /api 为前缀访问后端（Express）。
- 框架与库：Node.js + Express + Sequelize + SQLite3，JWT 认证，bcryptjs 密码哈希，dotenv 环境变量，cors 跨域。
- 运行模式：开发用 SQLite 数据库文件（server/database.sqlite），支持未来平滑切换到 MySQL/PostgreSQL。

**目录结构**
- server/
  - src/
    - app.ts|js（创建 Express 应用、注册中间件和路由）
    - config/
      - env.ts|js（读取 .env）
      - db.ts|js（Sequelize 实例，连接 SQLite）
    - models/（Sequelize 模型）
      - User.ts|js, Hotel.ts|js, RoomType.ts|js,
      - RoomDailyInventory.ts|js, Order.ts|js, Schedule.ts|js, Transaction.ts|js
    - routes/（Express 路由）
      - auth.ts|js, dashboard.ts|js, hotels.ts|js,
      - rooms.ts|js, orders.ts|js, analytics.ts|js, finance.ts|js
    - controllers/（业务控制器，对应每个路由）
    - middlewares/
      - auth.ts|js（JWT 校验）, error.ts|js（统一错误处理）
    - utils/
      - response.ts|js（统一响应格式）, pagination.ts|js
    - seed/
      - seed.ts|js（从前端 mockData 衍生初始化数据）
  - .env（JWT_SECRET, PORT=3001, DB_PATH=./database.sqlite）
  - package.json（scripts: dev, start, seed, migrate）

**环境与中间件**
- CORS：允许来自前端地址的跨域访问（含凭据）。
- Body parser：JSON（10MB 上限）。
- JWT：/api/auth/* 无需认证，其余业务路由校验 Authorization: Bearer <token>。
- 错误处理：统一返回 {code, message, data}；日志输出简化为控制台，可后续接入 Winston。

**数据库与模型**
- User(id, username[unique], password_hash, name, avatar_url, role, created_at)
- Hotel(id, owner_id→User, name, address, status[operating|closed|maintenance], rating, image_url)
- RoomType(id, hotel_id→Hotel, name, base_price, total_stock, description)
- RoomDailyInventory(id, room_type_id→RoomType, date, price, available_stock, status[available|sold_out|closed])
- Order(id, user_id→User?, customer_name, contact_phone, hotel_id→Hotel, room_type_id→RoomType, check_in_date, check_out_date, room_count, total_amount, status[pending|confirmed|checked_in|cancelled|refunded], created_at)
- Schedule(id, user_id→User, event_content, event_time(HH:mm), location, type[meeting|task], created_at)
- Transaction(id, order_id→Order, type[income|refund|withdrawal], amount, status[success|pending|failed], timestamp)
- 关联：Hotel hasMany RoomType；RoomType hasMany RoomDailyInventory/Order；Order hasOne Transaction。

**API 设计**
- 认证（/api/auth）
  - POST /login：{username, password} → {token, user}
  - POST /register：{username, password, name} → {id}
  - GET /me：当前用户信息

- 首页看板（/api/dashboard）
  - GET /stats：今日营收、PV、入住率、待处理订单数
  - GET /chart/revenue：营收趋势折线数据（周/月/年）
  - Schedules：
    - GET /schedules：列表
    - POST /schedules：新增
    - PUT /schedules/:id：更新
    - DELETE /schedules/:id：删除

- 酒店与房型（/api/hotels, /api/rooms）
  - GET /hotels：商户旗下酒店列表
  - GET /hotels/:id/room-types：酒店房型列表
  - GET /rooms/calendar：房态日历（query：hotelId, startDate, endDate）
  - POST /rooms/price/batch-update：批量改价（{hotelId, roomTypeIds[], dateRange{start,end}, newPrice, newStock?}）
  - PATCH /rooms/:roomTypeId/status：房型上下线（接单设置房间级别）

- 订单（/api/orders）
  - GET /orders：分页+状态筛选
  - GET /orders/:id：详情
  - PATCH /orders/:id/status：状态流转（接单/退款/入住）
  - PUT /orders/settings：接单设置（酒店级与房型级策略）

- 数据中心（/api/analytics）
  - GET /overview：返回前端所需的 10 个图表数据（性别比例、年龄分布、新老客、来源地、预订行为、下单时间分布等）。

- 财务（/api/finance）
  - GET /summary：总收入、待结算、已提现
  - GET /transactions：交易流水（分页、类型筛选）

**请求/响应约定**
- 统一响应：{ code: 200, message: 'success', data: ... }
- 错误：{ code: 4xx/5xx, message, detail? }
- 分页：query {page=1, pageSize=20}；响应附带 {total, page, pageSize}

**数据初始化（seed）**
- 依据前端 mockData（HOTELS, ROOM_TYPES, ORDERS）生成初始记录：
  - Hotels/RoomTypes/Orders 按示例填充；
  - RoomDailyInventory：对未来 30 天生成默认价格与库存；
  - Schedules：示例日程；
  - Transactions：依据订单状态生成收入/退款流水。

**安全与合规**
- 密码哈希：bcryptjs（10 轮）
- Token 有效期：默认 7 天；支持刷新策略（后续迭代）
- 防护：参数校验（基本型）、防 SQL 注入（ORM）、CORS 白名单

**配置与运行**
- .env 示例：
  - PORT=3001
  - JWT_SECRET=replace_with_strong_secret
  - DB_PATH=./database.sqlite
- scripts：
  - dev：ts-node-dev 或 nodemon 启动 app
  - seed：执行数据初始化
  - start：生产启动

**交付物**
- 完整 Express 项目（server/）含模型、路由、控制器与中间件
- 数据库文件（database.sqlite）与初始化脚本
- Swagger/OpenAPI 文档（可选，若时间允许）

**与前端对接点**
- axios 基础地址：/api（见 [request.js](file:///d:/Trae/Hotel-Management/src/utils/request.js#L6-L17)）
- 对应页面调用：
  - 看板：/api/dashboard/*
  - 酒店/房型/房态：/api/hotels, /api/rooms/*
  - 订单与接单设置：/api/orders/*
  - 数据中心：/api/analytics/overview
  - 财务：/api/finance/*

请确认以上方案；确认后我将在 server 目录按该结构落地实现、编写模型与路由、接入 SQLite，并提供 seed 数据与启动脚本。