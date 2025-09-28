# i18n 自动化处理系统

## 概述

这是一个强大的 i18n 国际化自动处理系统，能够自动检测和处理 React/Next.js 项目中的中文字符串，并将其转换为 t() 函数调用，同时提供自动翻译功能。

## 核心功能

### 🚀 自动文件监听处理
- **实时监控**: 每10秒自动扫描项目中最近修改的文件
- **智能识别**: 自动识别包含中文字符串的 `.tsx`, `.ts`, `.jsx`, `.js` 文件
- **自动转换**: 将中文字符串替换为 `t()` 函数调用
- **导入管理**: 自动添加必要的 `useTranslation` 导入和声明

### 🌍 智能翻译系统
- **API 翻译**: 集成腾讯云翻译 API，支持高质量机器翻译
- **本地词典**: 内置常用词汇映射，降级到本地翻译
- **批量处理**: 支持并发翻译，提高处理效率
- **重试机制**: 自动重试失败的翻译任务

### 📁 文件同步功能
- **双向同步**: 中文翻译文件与英文翻译文件自动同步
- **增量更新**: 只处理变更的翻译条目
- **缓存优化**: 使用文件缓存避免重复翻译
- **完整性保护**: 自动清理删除的翻译键

## 系统架构

### 核心类结构

#### 1. AutoFileProcessor (自动文件处理器)
```javascript
class AutoFileProcessor {
  // 主要功能：
  - start()                    // 启动自动监听
  - checkAndProcessFiles()     // 检查并处理文件
  - findRecentlyChangedFiles() // 查找最近变更文件
  - processFileIfNeeded()      // 按需处理文件
  - stop()                     // 停止监听
}
```

#### 2. ChineseStringProcessor (中文字符串处理器)
```javascript
class ChineseStringProcessor {
  // 主要功能：
  - extractChineseStrings()    // 提取中文字符串
  - replaceChineseStrings()    // 替换为 t() 函数
  - updateCommonFile()         // 更新翻译文件
  - shouldProcessFile()        // 判断是否需要处理
}
```

#### 3. I18nSyncer (翻译同步器)
```javascript
class I18nSyncer {
  // 主要功能：
  - syncFile()                 // 同步单个文件
  - translateBatch()           // 批量翻译
  - parseI18nFile()           // 解析翻译文件
  - translateWithRetry()       // 重试翻译
}
```

#### 4. SmartTranslator (智能翻译器)
```javascript
class SmartTranslator {
  // 主要功能：
  - translate()               // 智能翻译
  - localTranslate()          // 本地词典翻译
  - controlledTranslate()     // 并发控制翻译
}
```

#### 5. TencentTranslator (腾讯翻译器)
```javascript
class TencentTranslator {
  // 主要功能：
  - translate()               // API 翻译
  - generateSignature()       // 生成签名
  - hmacSha256()             // 加密算法
}
```

### 路径配置系统

```javascript
const PATH_CONFIG = (() => {
  const baseRoot = path.join(__dirname, "..");
  const srcPath = path.join(baseRoot, "src");
  const i18nPath = path.join(srcPath, "i18n");
  const langPath = path.join(i18nPath, "lang");
  
  return {
    // 基础路径
    projectRoot: baseRoot,
    srcDir: srcPath,
    
    // i18n 路径结构
    i18nDir: i18nPath,
    i18nZhDir: path.join(langPath, "zh"),
    i18nEnDir: path.join(langPath, "en"),
    
    // 配置选项
    supportedExtensions: [".tsx", ".ts", ".jsx", ".js"],
    excludedDirs: ["node_modules", ".next", "dist", "scripts", ".git", "build"]
  };
})();
```

## 使用方法

### 基本使用

#### 1. 启动自动监听模式
```bash
node scripts/i18n-keyboard-listener.js
```
- 自动监听文件变化
- 实时处理中文字符串
- 后台运行翻译同步

#### 2. 手动同步翻译
```bash
node scripts/i18n-keyboard-listener.js --sync
```
- 手动同步所有中文翻译文件到英文
- 批量处理所有翻译条目
- 适用于初始化或批量更新场景

#### 3. 重试失败翻译
```bash
node scripts/i18n-keyboard-listener.js --retry
```
- 重新翻译之前失败的条目
- 自动识别 `[翻译失败: xxx]` 格式
- 使用重试机制提高成功率

#### 4. 清理未使用翻译
```bash
node scripts/i18n-keyboard-listener.js --cleanup
```
- 扫描源代码中实际使用的翻译键
- 自动删除未使用的翻译条目
- 保持翻译文件清洁

### 环境配置

#### 1. 腾讯云翻译 API 配置 (可选)
在项目根目录创建 `.env.local` 文件：

```env
# 腾讯云翻译 API 配置
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
TENCENT_REGION=ap-beijing
```

#### 2. 项目结构要求
```
project/
├── src/
│   ├── i18n/
│   │   ├── lang/
│   │   │   ├── zh/
│   │   │   │   ├── common.ts
│   │   │   │   └── network.ts
│   │   │   └── en/
│   │   │       ├── common.ts
│   │   │       └── network.ts
│   │   └── hooks.ts
│   └── components/
└── scripts/
    └── i18n-keyboard-listener.js
```

## 处理流程详解

### 1. 文件监听流程

```mermaid
graph TD
    A[启动监听] --> B[扫描 src 目录]
    B --> C[查找最近10秒修改的文件]
    C --> D{文件类型检查}
    D -->|支持的文件类型| E[提取中文字符串]
    D -->|不支持| F[跳过文件]
    E --> G{是否包含中文}
    G -->|是| H[替换为 t() 函数]
    G -->|否| I[标记已处理]
    H --> J[更新翻译文件]
    J --> K[同步英文翻译]
    K --> L[等待下次扫描]
    F --> L
    I --> L
    L --> B
```

### 2. 字符串转换示例

**转换前：**
```jsx
// JSX 内容
<div>用户登录</div>
<Button label="确认提交">

// 字符串变量
const message = "操作成功";
const title = '系统设置';
```

**转换后：**
```jsx
import { useTranslation } from "@/i18n/hooks";

function Component() {
  const { t } = useTranslation("common");
  
  return (
    // JSX 内容
    <div>{t("用户登录")}</div>
    <Button label={t("确认提交")}>
    
    // 字符串变量
    const message = t("操作成功");
    const title = t('系统设置');
  );
}
```

### 3. 翻译文件更新

**中文文件 (zh/common.ts)：**
```typescript
export default {
  "用户登录": "用户登录",
  "确认提交": "确认提交",
  "操作成功": "操作成功",
  "系统设置": "系统设置",
};
```

**英文文件 (en/common.ts)：**
```typescript
export default {
  "用户登录": "User Login",
  "确认提交": "Confirm Submit",
  "操作成功": "Operation Successful",
  "系统设置": "System Settings",
};
```

## 高级功能

### 1. 智能过滤机制

#### 文件过滤规则：
- **包含目录**: 只处理 `src/` 目录下的文件
- **排除目录**: 自动跳过 `node_modules`, `.next`, `dist`, `scripts`, `.git`, `build`
- **排除文件**: 不处理 i18n 目录下的翻译文件本身
- **文件类型**: 只处理 `.tsx`, `.ts`, `.jsx`, `.js` 文件

#### 字符串提取规则：
- **JSX 内容**: `<div>中文</div>` → `<div>{t("中文")}</div>`
- **JSX 属性**: `label="中文"` → `label={t("中文")}`
- **字符串字面量**: `"中文"` → `t("中文")`
- **过滤条件**: 排除已被 t() 包装的字符串

### 2. 并发控制

#### 翻译 API 并发控制：
```javascript
{
  maxConcurrency: 1,        // 最大并发数
  requestWindow: 1000,      // 请求窗口期 (毫秒)
  retryDelay: 8000,        // 重试延迟 (毫秒)
  maxRetries: 5            // 最大重试次数
}
```

#### 批量处理优化：
- 使用线程池模式处理翻译任务
- 自动限流避免 API 调用频率限制
- 失败任务自动重试，提高成功率

### 3. 缓存机制

#### 翻译缓存：
- **位置**: `.i18n-cache/` 目录
- **格式**: JSON 文件存储已翻译内容
- **策略**: 避免重复翻译相同内容
- **更新**: 源文件变更时自动更新缓存

#### 文件状态缓存：
- 记录每个文件的最后处理时间
- 避免重复处理未变更的文件
- 提高系统整体性能

## 错误处理与调试

### 常见错误类型

#### 1. API 配置错误
```
❌ 腾讯翻译 API 配置缺失
❌ TENCENT_SECRET_ID 格式错误
```
**解决方案**: 检查 `.env.local` 文件中的 API 配置

#### 2. 文件权限错误
```
❌ 处理文件时出错: EACCES: permission denied
```
**解决方案**: 确保脚本有读写项目文件的权限

#### 3. 翻译失败
```
⚠️ 翻译失败，降级到本地翻译
❌ 经过 5 次尝试后翻译失败
```
**解决方案**: 
- 检查网络连接
- 验证 API 配置
- 使用 `--retry` 命令重试失败项目

### 调试信息

系统提供详细的调试日志：

```
🔍 发现 3 个文件有变化:
  📄 src/components/UserForm.tsx
  📄 src/pages/dashboard.tsx
  📄 src/utils/helpers.ts

🔄 处理文件: src/components/UserForm.tsx
📋 发现 5 个中文字符串:
  1. "用户姓名"
  2. "邮箱地址"
  3. "提交表单"

📝 已更新中文 common.ts，添加了 3 个新条目
🌍 准备翻译 3 个新的中文字符串...
✅ 翻译完成: "用户姓名" → "User Name"
```

## 性能优化建议

### 1. 文件监听优化
- **扫描间隔**: 默认10秒，可根据需要调整
- **文件过滤**: 精确配置排除目录，减少扫描范围
- **增量处理**: 只处理实际变更的文件

### 2. 翻译性能优化
- **批量翻译**: 一次性处理多个翻译条目
- **并发控制**: 合理设置并发数，避免 API 限流
- **本地词典**: 扩展本地词典，减少 API 调用

### 3. 资源使用优化
- **内存管理**: 定期清理处理缓存
- **文件句柄**: 及时关闭文件流
- **进程管理**: 优雅处理进程退出

## 扩展开发

### 添加新的翻译源
```javascript
class CustomTranslator {
  async translate(text, from = "zh", to = "en") {
    // 实现自定义翻译逻辑
    return translatedText;
  }
}
```

### 扩展文件类型支持
```javascript
const PATH_CONFIG = {
  supportedExtensions: [".tsx", ".ts", ".jsx", ".js", ".vue", ".svelte"],
  // ...其他配置
};
```

### 自定义字符串提取规则
```javascript
extractChineseStrings(content) {
  // 添加新的正则表达式规则
  const customPatterns = [
    /customPattern([\u4e00-\u9fa5][^)]*)/g,
  ];
  // ...处理逻辑
}
```

## 最佳实践

### 1. 项目集成建议
- 在开发流程中集成自动监听模式
- 定期运行 `--sync` 确保翻译同步
- 使用 `--cleanup` 保持翻译文件整洁
- 配置 Git 钩子自动化处理

### 2. 团队协作建议
- 统一翻译文件格式和命名规范
- 建立翻译审核流程
- 维护团队共享的本地词典
- 定期备份翻译缓存

### 3. 代码质量建议
- 保持中文字符串简洁明了
- 避免在字符串中嵌入动态内容
- 使用语义化的翻译键名
- 及时处理翻译失败的条目

## 故障排除

### 常见问题解决

#### Q: 脚本运行后没有检测到文件变化？
A: 检查以下项目：
- 确认文件在 `src/` 目录下
- 确认文件类型为支持的扩展名
- 确认文件在最近10秒内有修改
- 检查文件是否被排除目录规则过滤

#### Q: 翻译 API 调用失败？
A: 检查以下配置：
- 验证 `.env.local` 中的 API 配置
- 确认网络连接正常
- 检查 API 调用频率是否超限
- 使用 `--retry` 命令重试失败项目

#### Q: 自动转换的 t() 函数不生效？
A: 确认以下设置：
- 检查 `useTranslation` 导入是否正确
- 确认组件中声明了 `const { t } = useTranslation("common")`
- 验证翻译文件路径配置
- 检查 i18n 系统初始化

#### Q: 文件被重复处理？
A: 可能原因：
- 文件时间戳异常
- 缓存文件损坏
- 删除 `.i18n-cache` 目录重建缓存

### 日志分析

通过日志输出可以分析系统运行状态：

- `🔍` 文件检测阶段
- `🔄` 文件处理阶段  
- `📝` 翻译文件更新
- `🌍` API 翻译调用
- `✅` 成功完成操作
- `⚠️` 警告信息
- `❌` 错误信息

根据日志符号可以快速定位问题所在阶段。

## 版本历史

### v1.0.0
- 基础自动监听功能
- 中文字符串提取和转换
- 腾讯云翻译 API 集成

### v1.1.0  
- 添加批量翻译功能
- 完善重试机制
- 优化并发控制

### v1.2.0
- 路径配置重构
- 添加清理功能
- 性能优化

### v1.3.0 (当前版本)
- 智能文件过滤
- 缓存机制优化
- 完善错误处理
- 增强调试信息

---

## 支持与反馈

如有问题或建议，请参考以下资源：

- 📖 查看项目 README 文件
- 🐛 提交 Issue 报告问题  
- 💡 提交 Pull Request 贡献代码
- 📧 联系项目维护者

---

*最后更新: 2025年9月27日*