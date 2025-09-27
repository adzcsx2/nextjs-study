// Next.js 环境变量配置
export const env = {
   // ==================== API 配置 ====================
   // API 基础地址
   baseAPI: process.env.NEXT_PUBLIC_BASE_API,

   // ==================== 应用配置 ====================
   // 应用标题
   appTitle: process.env.NEXT_PUBLIC_APP_TITLE || "Next.js 应用",
   
   // 应用版本
   appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "dev",
   
   // 环境名称
   envName: process.env.NEXT_PUBLIC_ENV_NAME || "development",

   // ==================== 国际化配置 ====================
   // 默认语言
   defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "zh",
   
   // 支持的语言列表
   supportedLanguages: process.env.NEXT_PUBLIC_SUPPORTED_LANGUAGES?.split(",") || ["zh", "en"],

   // ==================== 开发配置 ====================
   // 是否启用 Mock
   useMock:
      process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
      process.env.NODE_ENV === "development",

   // 调试模式
   debug:
      process.env.NEXT_PUBLIC_DEBUG === "true" ||
      process.env.NODE_ENV === "development",
   
   // 日志级别
   logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || "info",

   // ==================== 服务器配置 ====================
   // 应用端口
   port: process.env.PORT || "3000",

   // ==================== 环境判断 ====================
   // 是否为开发环境
   isDev: process.env.NODE_ENV === "development",

   // 是否为生产环境
   isProd: process.env.NODE_ENV === "production",
   
   // 是否为测试环境
   isTest: process.env.NODE_ENV === "test",

   // ==================== 腾讯云翻译配置 ====================
   // 腾讯云翻译服务配置（服务端使用）
   tencent: {
      secretId: process.env.TENCENT_SECRET_ID,
      secretKey: process.env.TENCENT_SECRET_KEY,
      region: process.env.TENCENT_REGION || "ap-beijing",
   },
} as const;

// 类型定义
export type EnvConfig = typeof env;

// 环境变量验证
export const validateEnv = () => {
   const errors: string[] = [];

   // 必需的环境变量检查
   if (!env.baseAPI) {
      errors.push("NEXT_PUBLIC_BASE_API 未配置");
   }

   if (!env.appTitle) {
      errors.push("NEXT_PUBLIC_APP_TITLE 未配置");
   }

   // 腾讯翻译服务检查（如果需要翻译功能）
   if (env.isDev && (!env.tencent.secretId || !env.tencent.secretKey)) {
      console.warn("⚠️ 腾讯云翻译配置未完整，自动翻译功能将不可用");
   }

   if (errors.length > 0) {
      console.error("❌ 环境变量配置错误:");
      errors.forEach(error => console.error(`  - ${error}`));
      throw new Error("环境变量配置不完整，请检查 .env.local 文件");
   }
};

// 打印环境信息（仅开发环境）
if (env.isDev && typeof window !== "undefined") {
   console.log("🚀 环境配置:", {
      appTitle: env.appTitle,
      envName: env.envName,
      appVersion: env.appVersion,
      baseAPI: env.baseAPI,
      useMock: env.useMock,
      debug: env.debug,
      defaultLanguage: env.defaultLanguage,
      supportedLanguages: env.supportedLanguages,
   });
}
