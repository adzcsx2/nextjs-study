# Next.js i18n 自动翻译系统

一个集成了腾讯云翻译API的Next.js项目，支持中文到英文的自动翻译和实时同步。

## ✨ 特性

- 🚀 **一键启动** - 只需 `npm run dev` 即可启动开发服务器和自动翻译
- 🔄 **实时同步** - 保存中文i18n文件时自动翻译并同步到英文文件
- 🧠 **智能翻译** - 优先使用腾讯云API，降级到本地词典翻译
- 📁 **文件监听** - 自动监听 `src/i18n/lang/zh/` 目录下的所有 `.ts` 文件
- ⚡ **防抖处理** - 1秒防抖机制，避免频繁触发翻译
- 💾 **缓存机制** - 智能缓存，只翻译新增或修改的内容
- 🛡️ **错误恢复** - 网络异常时自动降级到本地翻译

## 🚀 快速开始

### 1. 环境配置

在项目根目录创建 `.env.local` 文件：

```env
# 腾讯云翻译API配置
TENCENT_SECRET_ID=AKIDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TENCENT_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TENCENT_REGION=ap-beijing

# 其他配置...
```

> 📝 **获取腾讯云密钥**: 前往 [腾讯云控制台](https://console.cloud.tencent.com/cam/capi) 获取API密钥

### 2. 启动开发

```bash
npm run dev
```

这个命令会同时启动：
- Next.js 开发服务器 (默认端口3000)
- i18n 自动翻译监听器

## 📁 项目结构

```
src/
├── i18n/
│   └── lang/
│       ├── zh/          # 中文翻译文件（源文件）
│       │   ├── common.ts
│       │   └── network.ts
│       └── en/          # 英文翻译文件（自动生成）
│           ├── common.ts
│           └── network.ts
└── ...

scripts/
└── i18n-manager.js      # 统一的i18n管理脚本

.i18n-cache/             # 自动生成的缓存目录
├── common.ts.json
└── network.ts.json
```

## 🎯 使用方法

### 添加新的翻译内容

1. 编辑中文翻译文件（如 `src/i18n/lang/zh/common.ts`）：

```typescript
export default {
   hello: "你好",
   welcome: "欢迎使用我们的系统",
   newFeature: "新功能介绍", // 添加新内容
}
```

2. 保存文件

3. 监听器会自动检测变化并翻译，英文文件会自动更新：

```typescript
export default {
   hello: "Hello",
   welcome: "Welcome to our system",
   newFeature: "New Feature Introduction", // 自动翻译
}
```

### 修改现有翻译

当您修改中文内容时，对应的英文翻译也会自动更新。

## 🔧 技术实现

### 翻译策略

1. **腾讯云API优先**: 配置正确时使用高质量的机器翻译
2. **本地词典降级**: API不可用时使用内置的200+常用词汇翻译
3. **智能缓存**: 避免重复翻译，提高性能

### 监听机制

- 使用Node.js的 `fs.watch` 监听文件变化
- 1秒防抖处理，避免频繁触发
- 只处理 `.ts` 文件，忽略临时文件

### 文件处理

- 解析TypeScript导出对象
- 保持原有格式和注释
- 智能对比，只翻译变化的内容

## 📊 日志说明

运行时您会看到以下日志：

```
🔍 i18n 自动翻译监听器已启动
📂 监听目录: E:\your-project\src\i18n\lang\zh
💡 中文i18n文件变化时将自动同步英文翻译

📝 检测到文件变化: common.ts (change)
🚀 开始同步翻译: common.ts
──────────────────────────────────────────────────
📄 正在处理文件: common.ts
🔄 翻译: "新功能介绍"
✅ "新功能介绍" → "New Feature Introduction"
✅ 已更新英文文件: E:\your-project\src\i18n\lang\en\common.ts
💾 已更新缓存文件
✅ common.ts 同步完成
──────────────────────────────────────────────────
✅ 同步完成: common.ts
🔍 继续监听文件变化...
```

## 🛠️ 可用命令

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 + 自动翻译监听器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 代码检查 |

## 🔒 环境要求

- Node.js 18+
- 腾讯云翻译API密钥（推荐）

## 💡 最佳实践

1. **推荐工作流程**：
   - 专注编写中文i18n内容
   - 保存文件后稍等1-2秒让翻译完成
   - 检查终端日志确认翻译状态

2. **文件组织**：
   - 按功能模块组织i18n文件（如common.ts, network.ts等）
   - 保持中文文件的良好结构，英文文件会自动同步

3. **翻译质量**：
   - 腾讯云API提供高质量翻译
   - 网络异常时会降级到本地词典
   - 可以手动调整英文翻译内容

4. **性能优化**：
   - 系统会自动缓存翻译结果
   - 只翻译新增或修改的内容
   - 重复内容不会重复翻译

## 🚫 停止服务

使用 `Ctrl+C` 可以同时停止Next.js服务器和翻译监听器。

## 📝 许可证

MIT License

---

享受自动化的i18n翻译体验！ 🎉