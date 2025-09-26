# Next.js 动态代理配置说明

## 概述

本项目实现了一个灵活的 API 代理系统，支持通过环境变量动态配置代理目标，适用于不同的部署环境。

## 工作原理

### 1. 客户端请求流程

```
浏览器发起请求: /api/book/list
↓
Next.js rewrites 拦截: /api/*
↓
代理到目标服务器: https://mock.apifox.cn/m1/2398938-0-default/api/book/list
```

### 2. 环境区分

-  **客户端环境（浏览器）**: 使用相对路径 `/api`，由 Next.js 代理处理

## 配置方式

### 1. 环境变量配置

创建 `.env.local` 文件：

```bash
# 代理目标地址
PROXY_BASE_URL=https://your-api-server.com

```

### 2. 不同环境的配置

#### 开发环境 (.env.local)

```bash
PROXY_BASE_URL=https://mock.apifox.cn/m1/2398938-0-default
```

#### 测试环境 (.env.test.local)

```bash
PROXY_BASE_URL=https://test-api.yourcompany.com
```

#### 生产环境 (.env.production.local)

```bash
PROXY_BASE_URL=https://api.yourcompany.com
```

## 使用示例

### 1. 基本 API 调用

```typescript
import { http } from "@/utils/http";

// GET 请求
const getBooks = async () => {
   const response = await http.get("/book/list", { page: 1, size: 10 });
   return response.data;
};

// POST 请求
const createBook = async (bookData) => {
   const response = await http.post("/book", bookData, {
      showSuccess: true,
      showLoading: true,
   });
   return response.data;
};
```

### 2. 带配置的请求

```typescript
// 不显示 loading，显示成功消息
await http.put("/book/1", updateData, {
   showLoading: false,
   showSuccess: true,
   needToken: true,
});

// 防重复请求，重试机制
await http.get("/book/1", undefined, {
   preventDuplicate: true,
   retry: 3,
});
```

### 3. 文件上传和下载

```typescript
// 文件上传
const uploadFile = async (file: File) => {
   return await http.upload("/book/import", file, {
      showLoading: true,
      showSuccess: true,
   });
};

// 文件下载
const downloadReport = async () => {
   await http.download("/book/export", "books.xlsx");
};
```

## 配置选项

### RequestOptions 配置

```typescript
interface RequestOptions {
   preventDuplicate?: boolean; // 防重复请求，默认 true
   showLoading?: boolean; // 显示加载状态，默认 true
   showSuccess?: boolean; // 显示成功消息，默认 false
   needToken?: boolean; // 是否需要 token，默认 true
   retry?: number; // 重试次数，默认 0
   params?: Record<string, string | number | boolean | null | undefined>;
}
```

### Loading 配置

```typescript
import { setLoadingConfig } from "@/utils/http";

// 设置全局 loading 配置
setLoadingConfig({
   type: "antd", // 'antd' | 'store' | 'event' | 'none'
   antdOptions: {
      content: "加载中...",
      duration: 0,
   },
});
```

## 错误处理

系统自动处理以下错误：

-  401: 未授权，自动跳转登录页
-  403: 禁止访问
-  404: 资源不存在
-  500: 服务器错误
-  网络错误
-  请求超时（15 秒）

## 特性

### 1. 自动代理

-  开发环境和生产环境无需修改代码
-  通过环境变量灵活配置代理目标

### 2. 请求管理

-  防重复请求
-  请求超时控制
-  自动重试机制

### 3. 用户体验

-  自动 loading 状态
-  成功/失败消息提示
-  错误统一处理

### 4. 安全性

-  自动添加 Authorization 头
-  Token 过期自动处理

## 部署说明

### 1. 本地开发

```bash
# 复制环境变量模板
cp .env.example .env.local

# 修改配置
# PROXY_TARGET=https://your-dev-api.com

# 启动开发服务器
npm run dev
```

### 2. 生产部署

```bash
# 设置生产环境变量
export PROXY_TARGET=https://your-prod-api.com
export SERVER_API_URL=https://your-prod-api.com/api

# 或在 .env.production.local 中配置
# 构建和启动
npm run build
npm start
```

## 故障排查

### 1. 代理不生效

-  检查 `.env.local` 中的 `PROXY_TARGET` 配置
-  确认目标服务器地址是否正确
-  查看控制台是否有代理配置日志

### 2. 请求失败

-  检查网络连接
-  确认 API 接口地址是否正确
-  查看浏览器开发者工具的网络面板

### 3. Token 相关问题

-  确认 localStorage 中是否有有效的 token
-  检查 token 格式是否正确（Bearer token）

## 注意事项

1. **环境变量优先级**: `.env.local` > `.env.production` > `.env`
2. **客户端环境变量**: 必须以 `NEXT_PUBLIC_` 开头才能在浏览器中访问
3. **代理限制**: 仅在开发环境和 Next.js 构建的应用中有效
4. **CORS**: 通过代理可以解决跨域问题
5. **缓存**: 环境变量更改后需要重启开发服务器
