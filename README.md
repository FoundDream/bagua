# 八卦 · 命理推演

基于 **九部命理经典**（渊海子平、子平真诠、滴天髓、穷通宝典、三命通会、千里命稿、神峰通考、协纪辨方书、果老星宗）+ **Vertex AI Gemini** 的命理推演 Web 应用。

## 功能

- **八字排盘**：公历输入 → 自动立四柱 / 藏干 / 十神 / 纳音 / 五行 / 大运，AI 依经典推演格局用神。
- **每日运势**：命主八字 × 当日黄历神煞，AI 给出当日吉凶趋势与时辰宜忌。
- **择日选时**：在指定窗口内（最多 30 天）按建除十二神、二十八宿、彭祖百忌筛选，AI 给三星推荐。
- **六十四卦占卜**：三钱起卦动画 → 本卦 / 动爻 / 变卦，AI 依《周易》卦爻辞与梅花体用法解读。

## 架构

```
Browser
  │  POST /api/{bazi|daily|zeri|gua}
  ▼
Next.js Route Handler (Node.js runtime)
  ├── lib/bazi.ts / zeri.ts / gua.ts  ← 用 lunar-typescript 立盘
  ├── lib/skill.ts                    ← 加载 skill/references/*.md
  └── lib/vertex.ts                   ← @google-cloud/vertexai 流式生成
       ▲
       │  VERTEX_API_KEY (Express Mode)
       ▼
Google Cloud Vertex AI (gemini-2.5-pro)
```

每条 API 调用流程：

1. 服务端用 `lunar-typescript` 把用户输入转成结构化命盘 / 黄历 / 卦象。
2. 把命盘字符串 + 对应经典节录拼成 Prompt（system instruction）。
3. 调 Vertex AI Gemini 流式生成，response body 直接转发给浏览器。
4. 浏览器边接收边 `marked` 渲染。

## 配置 Vertex API Key

本项目用 **Vertex AI Express Mode**，只需一个 API Key 即可，无需服务账号 JSON。

获取 API Key 任选其一：

1. **Google AI Studio**（最快）：访问 https://aistudio.google.com/apikey 直接生成（同一 key 兼容 Vertex Express Mode）。
2. **GCP Console**：进入 Vertex AI → 顶部 "Get API key" → 启用 Express Mode → 复制 key。

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

填入：
- `VERTEX_API_KEY`：上一步获取的 key
- `VERTEX_MODEL`：默认 `gemini-2.5-pro`，可换 `gemini-2.5-flash`（更快更便宜）

> ⚠️ **不要把 API Key 提交到 git**。`.env.local` 已在 `.gitignore` 中。

## 启动

```bash
npm install
npm run dev
# 打开 http://localhost:3000
```

生产构建：

```bash
npm run build
npm run start
```

## 部署

API Key 模式部署到任何平台都很简单，只需把 `VERTEX_API_KEY` 设为环境变量：

- **Vercel**：项目 Settings → Environment Variables 添加 `VERTEX_API_KEY` 即可。
- **Cloud Run**：
  ```
  gcloud run deploy bagua --source . --region asia-northeast1 \
    --set-env-vars=VERTEX_API_KEY=YOUR_KEY,VERTEX_MODEL=gemini-2.5-pro
  ```
- **Docker / 自建**：运行时传 `-e VERTEX_API_KEY=xxx` 即可。

## skill 工作原理

`skill/SKILL.md` 索引了 9 部经典，每部对应 `references/*.md` 一份节录。

- `lib/skill.ts` 在不同 API 路由按需加载相关经典：
  - 八字 → 渊海子平 + 子平真诠 + 滴天髓 + 穷通宝典 + 千里命稿
  - 每日 → 渊海子平 + 滴天髓 + 三命通会
  - 择日 → 协纪辨方书 + 三命通会
  - 卦象 → 滴天髓 + 三命通会（旁参；周易主体由模型自身知识承担）
- 节录文本拼到 system instruction 中，并要求模型逐句标注引用来源。
- 经典文件读取做了内存缓存，首次访问后零开销。

要扩充经典，往 `skill/references/` 加 `.md` 即可，再到 `lib/skill.ts` 对应函数中加入文件名。

## 注意事项

- **时辰**：八字以真太阳时为准。本应用用系统时区，未做地理经度校正。如需精确，请以子平正法换算后再填入。
- **Gemini 输出**：温度 0.6–0.85 之间，不同请求会有差异；同一八字多次推演可能给出不同侧重，属正常。
- **免责**：本服务为文化研究与娱乐性质，不构成任何医学、法律、金融、人生决策建议。

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript (strict) |
| 样式 | Tailwind CSS |
| 推理 | `@google/genai` (Vertex Express Mode) → Gemini 2.5 |
| 历法 | `lunar-typescript`（农历、干支、黄历、节气、大运） |
| Markdown | `marked`（客户端渲染流式输出） |
