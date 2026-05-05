# 成长篇 (MindGrove)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

个人成长日记与任务管理单页应用（SPA），帮助你记录每日计划与生活点滴。

## 特性

- **每日计划** — 按日期管理每日任务，支持优先级标记（高/中/低）、完成状态切换、备注编辑与自动保存
- **生活记录** — 带心情标签的日记系统，84 种情绪覆盖积极、中性、消极与特殊四类，支持封面图片上传与富文本编辑
- **Live2D 互动角色** — 页面左下角常驻 Hiyori 角色，提供气泡提示与交互菜单
- **日式情绪体系** — 精细化的情绪枚举系统，每种情绪配有专属表情符号与颜色标识

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Vue 3（Composition API, `<script setup>`） |
| 语言 | TypeScript 5.9（严格模式） |
| 构建 | Vite 7.2 |
| UI 库 | Ant Design Vue 4.2 |
| CSS | UnoCSS 66（Wind3 + Attributify + Icons）+ SCSS |
| 路由 | Vue Router 4（History 模式，懒加载） |
| HTTP | Axios 1.13（请求/响应拦截器） |
| 富文本 | UEditorPlus（vue-ueditor-wrap） |
| Live2D | wl-live2d v1.0.8 |
| 工具库 | VueUse、Day.js、Lodash |

## 快速开始

### 环境要求

- Node.js >= 20
- pnpm（推荐）或 npm

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/devgrove.git

# 进入目录
cd devgrove

# 安装依赖
pnpm install
```

### 开发

```bash
pnpm dev
```

启动后访问 `http://localhost:5173`，API 请求代理至 `http://localhost:8081`。

### 构建

```bash
pnpm build
```

生产产物输出至 `dist/` 目录。

### 预览构建产物

```bash
pnpm preview
```

## 项目结构

```
src/
├── main.ts                     # 应用入口
├── App.vue                     # 根组件（ConfigProvider 主题配置）
├── router/index.ts             # 路由配置
├── request/index.ts            # Axios 封装
├── apis/                       # API 接口
├── enums/index.ts              # 情绪与优先级枚举
├── types/index.ts              # TypeScript 类型定义
├── components/                 # 公共组件
│   ├── main-header.vue
│   ├── live-2d.vue
│   └── udeitor-plus.vue
└── views/
    ├── Layout/                 # 主布局（侧边栏 + 内容区）
    ├── Home/                   # 每日计划
    ├── LifeRecord/             # 生活记录
    ├── Plan/                   # 每日总结（开发中）
    ├── KnowledgeTree/          # 知识树（开发中）
    ├── Interview/              # 面试题（开发中）
    └── NoFound/                # 404 页面
```

## 页面说明

### 每日计划（首页）

- 通过 DatePicker 切换日期查看任务
- 创建任务时填写标题、描述、日期、优先级、备注
- 优先级以颜色区分：高（红色）、中（橙色）、低（蓝色）
- 支持标记完成/回滚、编辑备注（防抖自动保存）、删除任务
- 空日期自动填充默认任务列表：单词、看书、运动、前端

### 生活记录

- 带封面图片与心情标签的日记卡片网格
- 4 类 84 种情绪可选，每种均有表情符号与颜色
- 集成 UEditorPlus 富文本编辑器
- 封面图片上传（JPEG/PNG，最大 5 MB）

## 开发脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 预览构建产物 |
| `pnpm lint` | ESLint 代码检查 |

## 环境变量

| 变量 | 说明 |
|------|------|
| `APP_NAME` | 应用名称，默认 `MindGrove` |
| `VITE_API_BASE_URL` | API 基础路径，默认 `/api` |
