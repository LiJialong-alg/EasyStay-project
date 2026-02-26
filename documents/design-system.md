# 酒店预订平台 - 设计系统 (Design System)

## 1. 设计概述

本设计系统旨在为**酒店预订平台**提供一套专业、高效且具有高度一致性的用户界面。
鉴于平台包含**商家端**和**管理端**两个独立的业务场景，设计语言在保持整体品牌调性统一的前提下，通过主题色区分不同的业务上下文。

*   **设计关键词**: 企业级 (Enterprise)、高效 (Efficient)、数据驱动 (Data-Driven)、清晰 (Clean)。
*   **视觉风格**: 扁平化为主，辅以轻微投影 (Subtle Shadow) 增加层级感，强调信息密度与可读性。

## 2. 双端主题系统

为了让用户清晰感知当前所处的工作环境，我们定义了双端主题色体系。

### 2.1 商家端主题 (Merchant Theme)
*   **主色 (Primary)**: **海神蓝 (Poseidon Blue) `#003580`**
    *   *灵感来源*: Booking.com / 携程风格，代表专业、稳重与信任。
*   **辅助色**: 天空蓝 `#e6f0ff` (背景/悬停), 活力橙 `#f59e0b` (高亮/行动点)。
*   **应用场景**: 商家后台、房态管理、订单处理。

### 2.2 管理端主题 (Admin Theme)
*   **主色 (Primary)**: **皇室紫 (Royal Purple) `#722ed1`**
    *   *寓意*: 监管、权威与智慧。
*   **辅助色**: 浅紫 `#f9f0ff`, 暗黑 `#1f1f1f` (侧边栏)。
*   **应用场景**: 平台总控、资金审批、商户监管。

## 3. 全局色彩规范

| 语义 | 颜色 | Hex | 用途 |
|------|------|-----|------|
| **Success** | 翡翠绿 | `#10b981` | 状态：已确认、营业中、提现成功 |
| **Warning** | 琥珀金 | `#f59e0b` | 状态：待审核、待处理、库存紧张 |
| **Error** | 珊瑚红 | `#ef4444` | 状态：已取消、已驳回、库存耗尽 |
| **Info** | 科技蓝 | `#3b82f6` | 状态：进行中、提示信息 |
| **Text Main** | 深灰 | `#0f172a` | 主要标题、正文 |
| **Text Sub** | 蓝灰 | `#64748b` | 次要信息、标签 |
| **Border** | 浅灰 | `#e2e8f0` | 边框、分割线 |
| **Background**| 亮灰 | `#f8fafc` | 页面整体背景 |

## 4. 排版系统 (Typography)

采用系统默认字体栈，确保在不同操作系统上的原生体验。

*   **Font Family**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
*   **字号规范**:
    *   **Page Title**: 24px (Bold)
    *   **Section Title**: 18px (SemiBold)
    *   **Card Title**: 16px (Medium)
    *   **Body Text**: 14px (Regular) - *核心业务字号*
    *   **Small Text**: 12px (Regular) - *辅助说明*

## 5. 组件设计规范

### 5.1 卡片 (Cards)
作为信息承载的主要容器，卡片应具备清晰的边界和层级。
*   **背景**: 白色 `#ffffff`
*   **圆角**: `8px` (适中，不圆润也不尖锐)
*   **边框**: `1px solid #e2e8f0`
*   **阴影**: `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)` (极轻微，仅用于分离背景)
*   **内边距**: 默认 `24px`，紧凑模式 `16px`。

### 5.2 导航栏 (Navigation)
*   **侧边栏 (Sidebar)**:
    *   深色背景 (商家端 `#001529`, 管理端 `#1a1a1a`)。
    *   选中项：高亮背景色 + 主题色文字。
*   **顶栏 (Header)**:
    *   白色背景，底部带分割线。
    *   显示面包屑导航、用户头像、通知铃铛。

### 5.3 数据表格 (Data Table)
OTA 后台核心是数据处理，表格设计至关重要。
*   **表头**: 浅灰背景 `#f8fafc`，加粗文字，固定高度 `48px`。
*   **行高**: 默认 `56px`，紧凑模式 `40px`。
*   **悬停**: 鼠标悬停行显示浅蓝/浅紫背景。
*   **操作列**: 始终固定在右侧，使用文字链接或图标按钮。

### 5.4 状态标签 (Status Tags)
使用 Ant Design 的 `Tag` 组件，统一状态色。
*   **待处理/审核中**: Orange
*   **已确认/营业中**: Green
*   **已入住/进行中**: Blue
*   **已取消/已下架**: Default (Gray) or Red

## 6. 交互与反馈

*   **加载状态**: 数据加载时，表格区域显示 `Spin` 加载动画，避免白屏。
*   **操作反馈**:
    *   成功操作：右上角 `message.success` 提示。
    *   危险操作（删除/驳回）：弹出 `Modal.confirm` 二次确认。
*   **空状态**: 列表为空时，展示 `Empty` 组件并提供“新建”引导按钮。

## 7. CSS 变量定义 (Implementation)

```css
:root {
  /* 基础色板 */
  --color-primary-merchant: #003580;
  --color-primary-admin: #722ed1;
  
  /* 功能色 */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* 布局尺寸 */
  --sidebar-width: 240px;
  --header-height: 64px;
  --border-radius-base: 8px;
  
  /* 阴影 */
  --shadow-card: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 商家端特定样式 */
.theme-merchant .ant-btn-primary {
  background-color: var(--color-primary-merchant);
}

/* 管理端特定样式 */
.theme-admin .ant-btn-primary {
  background-color: var(--color-primary-admin);
}
```
