// Next.js 环境变量配置
export const env = {
  // API 基础地址
  baseAPI: process.env.NEXT_PUBLIC_BASE_API || '/api',
  
  // 完整的后端API地址（服务端使用）
  serverAPI: process.env.SERVER_API_URL || 'https://mock.apifox.cn/m1/2398938-0-default/api',

  // 应用标题
  appTitle: process.env.NEXT_PUBLIC_APP_TITLE || 'Next.js App',

  // 应用端口
  port: process.env.PORT || '3000',

  // 是否启用 Mock
  useMock: process.env.NEXT_PUBLIC_USE_MOCK === 'true' || process.env.NODE_ENV === 'development',

  // 是否为开发环境
  isDev: process.env.NODE_ENV === 'development',

  // 是否为生产环境
  isProd: process.env.NODE_ENV === 'production',

  // 调试模式
  debug: process.env.NEXT_PUBLIC_DEBUG === 'true' || process.env.NODE_ENV === 'development',
}

// 打印环境信息（仅开发环境）
if (env.isDev && typeof window !== 'undefined') {
  console.log('🚀 环境配置:', env)
}

export default env
