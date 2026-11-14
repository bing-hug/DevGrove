# 成长篇 · MindGrove

一个用于「每日计划 + 生活日志」的个人成长记录应用：早上安排任务，晚上写点记录，月底回看自己的完成率与情绪变化。

技术栈：**Vue 3.5 · Vite 7 · TypeScript · ant-design-vue 4 · UnoCSS · UEditorPlus · wl-live2d**

## 功能

### 每日计划
- 按日期查看任务，未完成 / 已完成分组展示
- 新建、编辑、删除任务；完成 / 回滚；备注自动保存（防抖 1 秒）
- 优先级（高 / 中 / 低）与逾期标记，逾期任务单独汇总
- 一键完成当天所有任务，顶部显示完成环形进度

### 日历
- 月历视图，每格显示当日任务完成率圆环、心情 emoji、日志篇数
- 点击任意一天跳到该天的任务列表

### 生活日志
- 卡片列表，支持关键词搜索、心情筛选、分页
- 新建 / 编辑 / 删除日志；封面图上传（类型与 5MB 校验）
- 47 种心情（emoji + 颜色 + 强度分级）
- 详情抽屉完整渲染富文本，展示前做 HTML 消毒

### 数据回顾
- 本周完成率、连续达标天数、累计完成任务、日志总数
- 近 14 天完成率柱状图、近 16 周任务热力图
- 心情分布、成就徽章、本周回顾（可复制 / 下载 Markdown）

### 知识树 & 面试题
- 知识树：无限层级节点，叶子可标记「已掌握」，父节点自动汇总进度
- 面试题：题库 + 难度 + 标签，按艾宾浩斯间隔（1/2/4/7/15/30 天）安排复习
- 两者数据保存在浏览器本地，不依赖后端

### 其他
- Live2D 看板娘：按时间问候、按剩余任务播报、完成任务给正反馈
- 深浅色主题（浅色 / 深色 / 跟随系统）与主题色配置
- `Ctrl / ⌘ + K` 全局搜索任务与日志
- 移动端自适应：侧栏收起为抽屉

## 开发

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 类型检查 + 生产构建
npm run preview    # 预览构建产物
```

环境变量见 `.env`、`.env.development`、`.env.production`：

| 变量 | 说明 |
| --- | --- |
| `VITE_API_BASE_URL` | 后端地址，如 `http://8.130.145.175:80/v2` |
| `VITE_APP_ENV` | 环境标识 |
| `VITE_API_TIMEOUT` | 请求超时（毫秒） |
| `VITE_SOURCEMAP` | 生产是否输出 sourcemap |

开发环境请求统一走 `/api` 代理（见 `vite.config.ts`），生产环境直连 `VITE_API_BASE_URL`。

## 目录结构

```
src/
├── apis/            # 接口定义（plan / lifeRecord）
├── components/      # 通用组件（页头、全局搜索、富文本编辑器）
├── composables/     # 组合式逻辑（Live2D 陪伴）
├── enums/           # 优先级、心情枚举
├── request/         # axios 封装（统一 { success, errorMsg, data }）
├── router/          # 路由与菜单 meta
├── stores/          # 轻量全局状态（计划 / 日志 / 设置 / 知识树 / 面试题）
├── types/           # 统一类型定义
├── utils/           # 图片地址、消毒、统计、下载
└── views/           # Home / Calendar / LifeRecord / Summary / KnowledgeTree / Interview
```

## 约定

- 后端统一返回 `{ success: boolean, errorMsg: string, data: T }`，请求层已自动解包并在失败时全局提示
- 所有列表数据来自 `/plans` 与 `/lifeRecords`，前端做筛选、分页与统计，减少接口压力
- 本地数据键：`grove:theme-mode`、`grove:primary-color`、`grove:show-live2d`、`grove:knowledge-tree`、`grove:interview-questions`、`grove:seeded`
- 新增 / 修改 / 删除接口清单见 `后端接口清单.md`
