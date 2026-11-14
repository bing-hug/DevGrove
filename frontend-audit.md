# 前端项目体检与修复清单（D:\MyProject\vue3-vite）

- 体检日期：2026-11-14
- 范围：src 全量源码 + vite/tsconfig/uno/components.d.ts/.env 配置
- 验证基线：`npx vue-tsc -b` 修复前 0 错误、`npm run build` 修复前成功（32.07s）；修复后复跑同两项，结论见文末。
- 实测依据：本地后端 `http://127.0.0.1:8081`，`GET /plans` 返回 16 条真实数据（`start_date` 全量串 `"2026-01-04T01:29:57"`），`GET /lifeRecords` 返回 1 条（`life_date` 短日期 `"2026-01-07"`）。

## 一、分级统计

| 级别 | 数量 | 已修复 | 未修复 |
| --- | --- | --- | --- |
| P0（阻塞/功能错误） | 0 | 0 | 0 |
| P1（确定缺陷） | 4 | 3 | 1（配置错配，需后端/部署决策） |
| P2（隐患/死代码/建议） | 11 | 1 | 10（均不影响当前联调，按要求不动） |

## 二、问题明细

### F-001 ｜ P1 ｜ 已修复
- **文件:行号**：`src/views/Home/components/plan-item.vue:134`
- **问题**：逾期卡片 Tag 直接渲染后端原始 `planItem.start_date`。实测后端返回全量串 `"2026-01-04T01:29:57"`，页面上会显示一长串时间戳，与其它日期展示（短日期）不一致。
- **修复方式**：改用 `toDateKey(planItem.start_date)`（dayjs 归一为 `YYYY-MM-DD`），并在文件顶部补 import。已验证 dayjs 对 `"2026-01-04T01:29:57"`（无时区）与 `"2026-01-07"`（短日期）都能正确取到日期部分。
- **验证方式**：修复后 `npx vue-tsc -b` 0 错误；dev 环境打开首页，逾期卡片日期显示 `2026-01-04`。

### F-002 ｜ P1 ｜ 已修复
- **文件:行号**：`src/views/Home/home-view.vue:103-115, 213-217`
- **问题**：「全部完成」按钮 `:loading="seedLoading"` 绑错状态（seedLoading 只在首启播种时为真，正常挂载完即为 false），且 `completeAll` 无进行中防重，双击会并发发起两批 `setPlanStatus` 请求，产生重复请求与重复成功提示。
- **修复方式**：新增 `completing` ref，进入函数先判 `if (completing.value) return`，`finally` 中复位；按钮 loading 改绑 `completing`。
- **验证方式**：vue-tsc 0 错误；双击「全部完成」只发一批请求。

### F-003 ｜ P1 ｜ 已修复
- **文件:行号**：`src/stores/life-store.ts:18-22`
- **问题**：日志排序直接对原始 `life_date` 做字符串比较。当前后端返回短日期 `"2026-01-07"` 尚能按字典序排对，但任务契约要求前端兼容全量 `LocalDateTime` 串；一旦后端像 `start_date` 一样返回全量串，或长短混排，排序即错乱。
- **修复方式**：比较键统一改为 `toDateKey(a.life_date)` / `toDateKey(b.life_date)`，同日再按 id 倒序。
- **验证方式**：vue-tsc 0 错误；`GET /lifeRecords` 实测返回短日期，列表顺序不变。

### F-004 ｜ P2 ｜ 已修复
- **文件:行号**：`src/components/global-search.vue:140`、`src/views/LifeRecord/components/record-detail.vue:78`、`src/views/LifeRecord/components/record-item.vue:51`
- **问题**：三处原样渲染 `record.life_date`。当前后端为短日期，属预防性统一（与 F-001 同类）。
- **修复方式**：均改为 `toDateKey(...)`，补 import。
- **验证方式**：vue-tsc 0 错误。

### F-005 ｜ P2 ｜ 未修复（按要求不动 env）
- **文件:行号**：`.env.development:2`
- **问题**：`VITE_API_BASE_URL= http://localhost:8081` 等号后带一个前导空格。dotenv 会 trim，当前可正常工作，但写法脆弱（换库可能不 trim）。
- **未修复原因**：任务明确要求不改 `.env.development` 的 target，仅记录。

### F-006 ｜ P1 ｜ 未修复（需后端/部署决策）
- **文件:行号**：`.env.production:2`、`src/request/index.ts:30-32`、`src/utils/spliceImgUrl.ts:1-2,19-21`
- **问题**：生产 `VITE_API_BASE_URL=http://8.130.145.175:80/v2` 带 `/v2` 前缀；而后端 controller 为根路径（`/plans`、`/lifeRecords`、`/upload/uploadImg` 等，无 `/v2` context-path）。生产构建下 axios baseURL 会拼成 `http://8.130.145.175:80/v2/plans`，封面图也会拼成 `.../v2/upload/xxx.jpg`，将全部 404。且该远端当前实测「积极拒绝连接」不可用。
- **未修复原因**：dev 代理 target 按要求不动；`/v2` 是否来自网关路由属于后端部署侧决策，前端不擅自删前缀。详见「后端待改清单」B-002。

### F-007 ｜ P2 ｜ 未修复（仅记录）
- **文件:行号**：`.env.development:4`、`.env.production:4`、`types/global.d.ts:38`
- **问题**：`VITE_MOCK_ENABLED` 已声明且有类型声明，但全项目 `grep` 无任何代码读取该变量（mock 分支不存在）。死配置。
- **未修复原因**：删 env 不属于小修范围，保留记录。

### F-008 ｜ P2 ｜ 未修复（仅记录）
- **文件:行号**：`src/apis/plan.ts:10-14`
- **问题**：`queryPlansByDateApi`（`/plans/byStartDate`）导出但无任何调用方（日历/列表都走 `getAllPlansApi` 全量拉取后前端分组）。后端清单标注「保留接口」，前端暂不删。

### F-009 ｜ P2 ｜ 未修复（仅记录）
- **文件:行号**：`src/views/Plan/plan-view.vue`、`src/views/TestPage/test-page.vue`
- **问题**：两个页面均未在 `router/index.ts` 注册，属于死页面（plan-view 是占位 stub，test-page 是手写响应式 demo）。
- **未修复原因**：删文件需用户确认，不擅自删除。

### F-010 ｜ P2 ｜ 未修复（仅记录）
- **文件:行号**：`src/.idea/`（整个目录）
- **问题**：IDE 配置目录被误放进 `src/`。不影响构建（非 TS/Vue 文件），但不应进版本库。

### F-011 ｜ P2 ｜ 未修复（用户明确要求保留）
- **文件:行号**：`src/components/live-2d.vue`
- **问题**：无引用遗留组件（使用已废弃的 `live2d-render` 包）。实际看板娘由 `wl-live2d` 在 `layout-view.vue` 内直接初始化。
- **未修复原因**：任务明确「不要删，只在清单里提」。

### F-012 ｜ P2 ｜ 未修复（仅记录）
- **文件:行号**：`src/request/index.ts:90-93`
- **问题**：HTTP 401 时仅 `localStorage.removeItem('token')`，不跳转登录页、不提示重登。当前项目无登录体系、无路由守卫，token 为空时接口照常调用。
- **未修复原因**：登录体系是后端待建项，前端不提前造页面。

### F-013 ｜ P2 ｜ 未修复（仅记录）
- **文件:行号**：`vite.config.ts:48-51`、构建输出
- **问题**：`layout-view-*.js` chunk 955.77 kB（gzip 266 kB），因 `wl-live2d` 被静态 import 进 layout-view。构建仅警告未失败。
- **未修复原因**：分包/动态 import 属于较大重构，按任务「小而准」原则不动。

### F-014 ｜ P2 ｜ 未修复（仅记录）
- **文件:行号**：`src/views/Home/components/plan-item.vue:25`
- **问题**：`remark = ref(props.planItem.remark)` 仅在 setup 时取一次初值。任务经弹窗编辑后，卡片组件因 key 复用不会重新同步 remark 文本（需刷新列表才正确）。边界情况。
- **未修复原因**：加 watch 会和用户输入中的备注自动保存形成回环，需谨慎设计，本轮不动。

### F-015 ｜ P2 ｜ 未修复（仅记录）
- **文件:行号**：`src/stores/plan-store.ts:15`、`src/stores/life-store.ts:11`
- **问题**：`if (loading.value) return records.value` 进行中再次请求直接返回旧引用，调用方 `await` 拿到的可能是空数组。当前所有挂载点都是 `force=true` 首次拉取，无实际影响。
- **未修复原因**：改并发队列属于行为变更，本轮不动。

## 三、后端必须改动 / 确认清单（前端未动后端代码）

| 编号 | 路径 | 现状（实测） | 期望 |
| --- | --- | --- | --- |
| B-001 | `GET /plans` 返回字段 `start_date` | 实测 `"2026-01-04T01:29:57"`（LocalDateTime 全量串，SNAKE_CASE 全局序列化） | 契约要求 `YYYY-MM-DD`（如 `"2026-01-04"`）。前端已兼容解析（dayjs 取日期部分），但后端应将日期字段改为 `LocalDate` 或加 `@JsonFormat(pattern="yyyy-MM-dd")` |
| B-002 | 生产 baseURL `/v2` 前缀 vs 后端 controller 根路径 | `.env.production` = `http://8.130.145.175:80/v2`，后端 controller 无 `/v2` | 二选一：网关/部署加 `/v2` context-path，或 `.env.production` 去掉 `/v2`。否则生产环境所有接口 404 |
| B-003 | `POST /updatePlan`、`POST /updateLifeRecord`、`POST /delLifeRecord` | 前端已按契约接入（update 为 JSON body `{id, ...字段}`；del 为 query `?id=`） | 请后端确认三个接口已上线且返回统一 `{success, errorMsg, data}` |
| B-004 | `POST /upload/uploadImg` 返回 `data` | 实测 `lifeRecords[0].cover = "upload/表情_1767757137600.jpg"`（相对路径） | 保持相对路径即可，前端 `spliceImgUrl` 已拼 baseURL；但生产 baseURL 若带 `/v2`（B-002），图片 URL 会同步错 |

## 四、验证留证（修复后）

- `npx vue-tsc -b`：退出码 0，无任何输出（0 错误）。
- `npm run build`：退出码 0，`✓ built in 38.50s`，3327 modules transformed，仅 1 条 chunk >500kB 警告（layout-view，见 F-013）。
- dev server（http://localhost:5173）未重启、未 kill；本次改动均为纯前端逻辑，HMR 可热更新，无需重启。

---

## 五、方向 1：复习 → 任务闭环（本轮新增）

### 5.1 数据契约偏差记录
- 需求原文 `source_id: number | null`，实际落地为 **`string | null`**。理由：知识树节点 id 全是字符串（`'js-base'`、`'vue-reactivity'`、`'vite'`、`'fitness'`），面试题 id 也是字符串（`'seed-1'`…），数字类型存不下；后端列按 VARCHAR(64)。类型定义见 `src/types/index.ts`。

### 5.2 改动文件清单（文件:行）
| 文件 | 行 | 改动 |
| --- | --- | --- |
| `src/types/index.ts` | 全文件 | 新增 `PlanSourceType = 'knowledge' \| 'interview'`；`PlanItem`、`PlanPayload` 各加可选 `source_type?`、`source_id?` |
| `src/stores/knowledge-store.ts` | 142-184 | 新增 `DueNode` 接口、`dueNodes()`、`markMastered(id)`，并在 `useKnowledgeStore()` 返回值导出 |
| `src/stores/interview-store.ts` | 未改函数体 | 复用现有 `dueQuestions()` 过滤条件（`!mastered && nextReview <= 今天`），到期原因在视图层用 `nextReview` 日期文案 |
| `src/composables/use-source-sync.ts` | 新文件全文 | `writebackSourceDone(plan)`：knowledge→`markMastered`，interview→`markReviewed`，try/catch 兜底 |
| `src/views/Home/components/plan-item.vue` | 45-66 | `togglePlanStatus` 中 `next===true` 时调用 `writebackSourceDone`；回滚（next=false）不回写 |
| `src/views/Home/home-view.vue` | 25-28、54-130、104-124、330-368 | 新增 reviewList / joinedSourceKeys / joinedLocally / joinToToday；completeAll 批量完成时逐条回写；模板新增「今日复习」区块 |

### 5.3 新增函数签名
```ts
// knowledge-store.ts
export interface DueNode { id: string; title: string; pathText: string }
function dueNodes(): DueNode[]          // 所有未掌握叶子节点，pathText 如「前端 / JavaScript」
function markMastered(id: string): void // 幂等：节点不存在或已掌握则不动

// composables/use-source-sync.ts
function writebackSourceDone(plan: Pick<PlanItem,'source_type'|'source_id'>): void

// home-view.vue
interface ReviewEntry { key: `${PlanSourceType}:${string}`; sourceType; sourceId; title; reasonText; remark }
const reviewList = computed<ReviewEntry[]>(...)
const joinedSourceKeys = computed<Set<string>>(...)
async function joinToToday(entry: ReviewEntry): Promise<void>
```

### 5.4 去重键实现方式
- 键格式：`` `${source_type}:${source_id}` ``，如 `knowledge:js-base`、`interview:seed-1`。
- 判定集合 = 两部分 union：
  1. 从 `planStore.plans` 全量数据里筛「`source_type`/`source_id` 非空 且 `toDateKey(start_date) === 今天`」的计划（后端为准，刷新后生效）；
  2. `joinedLocally`（组件内 Set）：本次会话内成功调过 `createPlanApi` 的键，点击成功后立即加入并触发重渲染。
- **判定字段自查**：`joinedSourceKeys` 只依赖 `source_type`、`source_id`、`start_date` 三个字段（外加 `toDateKey(start_date) === 今天`），不读 `created_at`、不依赖其它额外字段。
- **B-005 已核实为误判**（详见 5.6）：我做探针时打到的是 8081 旧构建实例；新构建（8083）`GET /plans` 已回传 `source_type`/`source_id`。因此在 8083 上第 1 部分（后端数据推导）真实生效，**F5 刷新后按钮仍置灰**。第 2 部分 `joinedLocally` 保留为「点击后立即置灰、不等网络回包」的乐观 UX，与后端数据取并集，不冲突。

### 5.5 完成回写覆盖的勾选入口
| 入口 | 文件:行 | 是否走统一回写 |
| --- | --- | --- |
| 单条卡片「完成/回滚」按钮 | `src/views/Home/components/plan-item.vue:45-66` | 是（next=true 才回写） |
| 首页「全部完成」 | `src/views/Home/home-view.vue:104-124` | 是（`pending.forEach(writebackSourceDone)`） |
| 日历页 / 全局搜索 | 无勾选入口（点击日期跳首页、搜索只跳详情） | 无需覆盖 |
- 统一落点：`writebackSourceDone()`（composables/use-source-sync.ts），两个入口都调它，无第三处 `setPlanStatusApi` 调用。
- 回滚（next=false）刻意不回写；删除任务不联动删除已掌握/复习进度（knowledge/interview 存 localStorage，plans 走后端，无外键联动）。

### 5.6 后端待改清单（追加）
| 编号 | 内容 | 实测证据 |
| --- | --- | --- |
| ~~B-005~~ **误判，已撤销** | ~~`GET /plans` 必须回传 `source_type`/`source_id`~~ | 三个实例对比：`http://127.0.0.1:8083/plans`（方向 1 新构建）→ **回传**，样本 `"id":25,...,"source_type":null,"source_id":null,...`；`http://127.0.0.1:8082/plans`（上一轮旧构建）→ 无 source_type（len 2789）；`http://127.0.0.1:8081/plans`（用户常驻旧构建，pid 28464）→ 无 source_type（len 2933）。**结论：8083 新构建已回传，去重①分支生效，F5 刷新后按钮仍置灰，不存在「等后端补字段」缺口，前端无需改代码。教训：后端契约探针必须打新构建实例，8081/8082 是旧构建。** |

### 5.7 本轮验证留证
- `npx vue-tsc -b`：退出码 0。
- `npm run build`：退出码 0（见任务返回最终摘要）。
- 后端契约探针：POST /createPlan 带 source 字段 → 200 成功；随即 POST /delPlan 删除探针行，无垃圾数据残留。
- 未验证项：浏览器内真实 UI 交互（按钮置灰、区块渲染、勾选后 knowledge/interview 状态变化）需测试 agent 在 5173/5174 上肉眼确认；Live2D/编辑器未触碰。

### 5.8 N1（P1，已修复）
- **文件:行号**：`src/views/Home/home-view.vue:313-394`（本轮方向 1 改动引入）。
- **问题**：「今日复习」区块原来放在 `<div v-if="dayList.length">` 内部，导致今日 0 任务时整个复习区块不渲染（页面只显示 Empty 空态），用户无法「加入今日任务」——而「今日 0 任务」是每日开头的常态。测试实测：0 任务时复习区不可见，手工加 1 条任务后 9 项复习内容才出现。
- **修复方式**：把 `<section class="mt-16">今日复习</section>` 移出 `v-if="dayList.length"` 门控，作为 Spin 内与「任务列表 div / Empty」并列的第三个兄弟节点，无论今日有没有任务都渲染；自身保留空态文案（无到期内容时显示「今天没有需要复习的内容，休息一下」）；用 `mt-16` 与上方 Empty/任务列表拉开 16px 间距，避免「Empty + 复习区」挤在一起。
- **验证方式**：`npx vue-tsc -b` 0 错误；`npm run build` 成功；DOM 层级：Spin → [任务列表 div(v-if) / Empty(v-else-if) / 复习 section(always)]，今日 0 任务时 Empty 与复习区并列渲染。

