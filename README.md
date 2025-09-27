# Next.js 智能 i18n 自动化项目

一个 Next.js 练手项目，支持国际化多语言自动转换：自动将页面中的中文字符串转换为 i18n 的 t() 函数调用，并自动生成对应的中英文翻译键值对。让你只需专注于页面开发，i18n 国际化完全自动处理！

## ✨ 核心特性

-  🎯 **智能字符串转换** - 自动将 JSX 中的中文字符串转换为 `t("key")` 格式
-  🔄 **自动键值对生成** - 自动在中文翻译文件中添加对应的键值对
-  🌍 **实时英文翻译** - 腾讯翻译 API 自动生成英文翻译并同步
-  📁 **10 秒智能监控** - 每 10 秒自动检测文件变化并处理
-  🧹 **自动清理优化** - 启动时自动清理未使用的翻译键，保持文件整洁
-  ⚡ **并发处理机制** - 智能批量处理，支持重试和错误恢复
-  🛡️ **格式保护** - 完美保持代码格式，支持 Prettier 兼容
-  🚀 **多环境部署** - 支持开发、测试、生产环境的自动化部署

## 🏗️ 多环境构建与部署

### 环境配置

项目支持三种环境，每种环境都有独立的配置文件：

-  `.env.local` - 本地开发配置（优先级最高，不会上传到仓库）
-  `.env.test` - 测试环境配置
-  `.env.production` - 生产环境配置

#### 主要环境变量说明

| 变量名                  | 说明               | 示例值                      |
| ----------------------- | ------------------ | --------------------------- |
| `NEXT_PUBLIC_BASE_API`  | API 基础地址       | https://api.example.com     |
| `NEXT_PUBLIC_APP_TITLE` | 应用标题           | 应用系统(开发版)            |
| `NEXT_PUBLIC_ENV_NAME`  | 环境标识           | development/test/production |
| `NEXT_PUBLIC_USE_MOCK`  | 是否使用 Mock 数据 | true/false                  |
| `NEXT_PUBLIC_DEBUG`     | 调试模式           | true/false                  |
| `PORT`                  | 应用端口           | 3000/3001                   |

> 📝 **完整配置指南**: 查看 [环境变量配置指南](./docs/ENV_GUIDE.md) 获取详细说明

### 构建命令

```bash
# 开发环境
npm run dev                    # 开发模式启动

# 测试环境
npm run build:test             # 构建测试版
npm run start:test             # 启动测试版 (端口: 3001)

# 生产环境
npm run build:production       # 构建生产版
npm run start:production       # 启动生产版 (端口: 3000)
```

### 自动化部署

使用部署脚本进行一键部署：

```bash
# 本地构建
./deploy.sh local-test         # 本地构建测试版
./deploy.sh local-production   # 本地构建生产版

# 服务器部署（需先配置服务器信息）
./deploy.sh test              # 构建并部署测试版到服务器
./deploy.sh production        # 构建并部署生产版到服务器
```

### 部署脚本配置

在使用服务器部署前，需要修改 `deploy.sh` 中的服务器配置：

```bash
# 编辑部署脚本中的配置
SERVER_USER="your-username"      # 服务器用户名
SERVER_HOST="your-server-ip"     # 服务器IP地址
SERVER_PATH="/var/www/app"       # 部署路径
```

### PM2 进程管理

部署后使用 PM2 管理应用进程：

```bash
# 查看所有进程
pm2 list

# 查看日志
pm2 logs app-test              # 测试版日志
pm2 logs app-production        # 生产版日志

# 重启服务
pm2 restart app-test           # 重启测试版
pm2 restart app-production     # 重启生产版

# 停止服务
pm2 stop app-test              # 停止测试版
pm2 stop app-production        # 停止生产版
```

### 环境对比

| 环境 | 端口 | PM2 进程名     | 配置文件        | 访问地址              |
| ---- | ---- | -------------- | --------------- | --------------------- |
| 开发 | 3000 | -              | .env.local      | http://localhost:3000 |
| 测试 | 3001 | app-test       | .env.test       | http://服务器 IP:3001 |
| 生产 | 3000 | app-production | .env.production | http://服务器 IP:3000 |

> 📝 **详细部署说明**: 查看 [DEPLOYMENT.md](./docs/DEPLOYMENT.md) 获取完整的部署指南

## 🚀 快速开始

### 1. 环境配置

复制环境配置示例文件并根据你的需要进行配置：

```bash
# 复制配置文件
cp .env.example .env.local
```

在 `.env.local` 文件中配置必要的环境变量：

```env
# ==================== API 配置 ====================
# API 基础地址 - 用于接口代理和请求
NEXT_PUBLIC_BASE_API=https://mock.apifox.cn/m1/2398938-0-default

# ==================== 应用配置 ====================
# 应用标题
NEXT_PUBLIC_APP_TITLE=图书管理系统(开发版)

# ==================== 腾讯云翻译服务配置 ====================
# 腾讯云机器翻译配置 - 用于自动 i18n 翻译（可选）
TENCENT_SECRET_ID=your_secret_id_here
TENCENT_SECRET_KEY=your_secret_key_here
TENCENT_REGION=ap-beijing
```

> 📝 **详细配置说明**: 查看 [环境变量配置指南](./docs/ENV_GUIDE.md) 获取完整的配置说明  
> � **获取腾讯云密钥**: 前往 [腾讯云控制台](https://console.cloud.tencent.com/cam/capi) 获取 API 密钥

### 2. 启动开发

```bash
npm run dev
```

这个命令会同时启动：

-  🧹 **自动清理** - 清理未使用的翻译键
-  ⚡ **Next.js 开发服务器** (默认端口 3000)
-  🤖 **i18n 自动转换监听器** - 每 10 秒检测文件变化

## 🎯 工作原理

### 自动转换流程

1. **检测中文字符串**: 监听 `.tsx/.jsx/.ts/.js` 文件中的中文内容
2. **智能替换**: 将 `"中文内容"` 自动替换为 `{t("生成的键名")}`
3. **生成键值对**: 在 `src/i18n/lang/zh/common.ts` 中自动添加键值对
4. **自动翻译**: 调用腾讯翻译 API 生成英文翻译
5. **同步更新**: 自动更新 `src/i18n/lang/en/common.ts`

### 转换示例

**转换前** (`src/app/page.tsx`):

```tsx
export default function HomePage() {
   return (
      <div>
         <h1>欢迎使用图书管理系统</h1>
         <p>这是一个现代化的管理平台</p>
      </div>
   );
}
```

**转换后**:

```tsx
export default function HomePage() {
   return (
      <div>
         <h1>{t("欢迎使用图书管理系统")}</h1>
         <p>{t("这是一个现代化的管理平台")}</p>
      </div>
   );
}
```

**自动生成的翻译文件**:

`src/i18n/lang/zh/common.ts`:

```typescript
export default {
   欢迎使用图书管理系统: "欢迎使用图书管理系统",
   这是一个现代化的管理平台: "这是一个现代化的管理平台",
};
```

`src/i18n/lang/en/common.ts`:

```typescript
export default {
   欢迎使用图书管理系统: "Welcome to the Library Management System",
   这是一个现代化的管理平台: "This is a modern management platform",
};
```

## 📁 项目结构

```
next_app/
├── .env.example         # 环境变量配置示例
├── .env.local          # 本地环境配置（不上传到仓库）
├── .env.test          # 测试环境配置
├── .env.production    # 生产环境配置
├── docs/
│   ├── ENV_GUIDE.md   # 环境变量配置指南
│   └── DEPLOYMENT.md  # 部署指南
├── src/
│   ├── config/
│   │   └── env.ts     # 环境变量配置管理
│   ├── i18n/
│   │   └── lang/
│   │       ├── zh/    # 中文翻译文件（自动生成）
│   │       │   ├── common.ts
│   │       │   └── network.ts
│   │       └── en/    # 英文翻译文件（自动翻译生成）
│   │           ├── common.ts
│   │           └── network.ts
│   ├── app/           # 页面文件（中文字符串自动转换）
│   │   ├── page.tsx
│   │   └── ...
│   └── ...
├── scripts/
│   └── i18n-keyboard-listener.js  # 智能i18n自动处理脚本
├── deploy.sh          # 自动化部署脚本
└── ecosystem.config.json  # PM2进程管理配置
```

## 🔧 技术实现

### 自动转换策略

1. **文件监控**: 每 10 秒扫描项目文件，检测最近修改的文件
2. **中文识别**: 使用正则表达式精确匹配 JSX 中的中文字符串
3. **智能替换**: 保持原有格式，只替换字符串内容为 t()调用
4. **键名生成**: 直接使用中文内容作为键名，简化管理
5. **批量翻译**: 使用腾讯翻译 API 批量处理新增内容
6. **错误重试**: 翻译失败时自动重试，确保同步成功

### 清理机制

-  **启动时清理**: 每次 `npm run dev` 和 `npm run build` 时自动清理未使用的翻译键
-  **智能扫描**: 扫描所有源文件中实际使用的 `t("key")` 调用
-  **安全删除**: 只删除未被引用的翻译键，保持文件整洁

### 格式保护

-  **Prettier 兼容**: 配置 `.prettierignore` 保护翻译文件格式
-  **原始结构保持**: 转换时保持 JSX 的原有缩进和格式
-  **注释保留**: 智能保留翻译文件中的注释内容

## 🎯 使用方法

### 1. 正常编写页面代码

只需要像平时一样编写包含中文的 React 组件：

```tsx
// 你只需要写这样的代码
function LoginPage() {
   return (
      <div>
         <h1>用户登录</h1>
         <Button>立即登录</Button>
         <p>
            还没有账号？<a href="#">立即注册</a>
         </p>
      </div>
   );
}
```

### 2. 自动转换生效

保存文件后，系统会在 10 秒内自动处理，将代码转换为：

```tsx
// 自动转换后的代码
function LoginPage() {
   return (
      <div>
         <h1>{t("用户登录")}</h1>
         <Button>{t("立即登录")}</Button>
         <p>
            {t("还没有账号？")}
            <a href="#">{t("立即注册")}</a>
         </p>
      </div>
   );
}
```

### 3. 手动命令

如果需要手动控制，可以使用以下命令：

```bash
# 清理未使用的翻译键
npm run i18n_clean
```

## 📊 运行日志示例

启动后你会看到类似的日志输出：

```
🧹 开始清理未使用的翻译键...
� 扫描结果：
  - 使用中的键: 15
  - 中文未使用键: 3
  - 英文未使用键: 5
🧹 已从中文文件删除 3 个未使用的键
🧹 已从英文文件删除 5 个未使用的键
✅ 清理完成！

🎯 自动文件处理器已启动

功能说明:
  • 每10秒自动检测文件变化
  • 处理最近10秒内修改的文件
  • 自动替换中文字符串为 t() 函数
  • 只处理 .tsx, .ts, .jsx, .js 文件

� 监听已开始，每10秒检查一次文件变化...

� 检测到文件变化: src/app/login/page.tsx
🔄 开始处理中文字符串...
✅ 替换: "用户登录" → t("用户登录")
✅ 替换: "立即登录" → t("立即登录")
📄 已更新文件: src/app/login/page.tsx
🌍 开始翻译新增内容...
✅ "用户登录" → "User Login"
✅ "立即登录" → "Login Now"
� 已同步到英文翻译文件
✅ 处理完成！
```

## 🛠️ 可用命令

| 命令                 | 描述                                         |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | 启动开发服务器 + 自动 i18n 转换器 + 自动清理 |
| `npm run build`      | 构建生产版本（构建前自动清理）               |
| `npm run start`      | 启动生产服务器                               |
| `npm run lint`       | 代码检查                                     |
| `npm run i18n_clean` | 手动清理未使用的翻译键                       |

## 🔒 环境要求

-  **Node.js 18+**: 运行 Next.js 应用的基础要求
-  **环境配置文件**: 正确配置 `.env.local` 文件
-  **腾讯云翻译 API**: 可选，用于自动英文翻译功能

### 必需配置

-  `NEXT_PUBLIC_BASE_API`: API 基础地址
-  `NEXT_PUBLIC_APP_TITLE`: 应用标题

### 可选配置

-  `TENCENT_SECRET_ID` & `TENCENT_SECRET_KEY`: 腾讯云翻译密钥

> 📝 **完整配置清单**: 查看 [环境变量配置指南](./docs/ENV_GUIDE.md)

## 💡 最佳实践

1. **推荐开发流程**：

   -  ✅ 正常编写包含中文的 React 组件
   -  ✅ 保存文件后等待 10 秒内的自动转换
   -  ✅ 检查终端日志确认处理状态
   -  ✅ 英文翻译会自动同步，无需手动干预

2. **代码组织建议**：

   -  🎯 专注于页面功能开发，i18n 完全自动化处理
   -  📝 中文内容写得越规范，翻译质量越好
   -  🔄 系统会自动处理 JSX 中的所有中文字符串

3. **性能优化特点**：

   -  ⚡ 智能检测：只处理最近 10 秒内修改的文件
   -  🧹 自动清理：启动时自动移除未使用的翻译键
   -  🔄 批量处理：多个文件变化时批量处理，提高效率
   -  💾 避免重复：相同内容不会重复翻译

4. **错误处理机制**：
   -  🛡️ 翻译 API 失败时自动重试
   -  📋 详细日志输出，便于问题排查
   -  🔧 格式保护，不会破坏原有代码结构

## ⚠️ 注意事项

-  🚫 **不要手动编辑** `src/i18n/lang/en/` 下的文件，它们由系统自动生成
-  ✅ **可以手动调整** 自动生成的英文翻译内容，但重新运行时可能被覆盖
-  🔧 **确保正确配置** 腾讯翻译 API 密钥以获得最佳翻译质量
-  📁 **保持文件结构** 不要移动或重命名 i18n 相关文件夹

## 🚫 停止服务

使用 `Ctrl+C` 可以同时停止 Next.js 服务器和自动转换监听器。

## 📝 许可证

MIT License

---

🎉 **享受完全自动化的 React 国际化开发体验！**  
_专注写页面，i18n 交给系统自动处理！_
