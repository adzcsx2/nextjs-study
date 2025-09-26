// Next.js 环境变量配置
export const env = {
   // API 基础地址
   baseAPI: process.env.NEXT_PUBLIC_BASE_API,

   // 应用标题
   appTitle: process.env.NEXT_PUBLIC_APP_TITLE,

   // 应用端口
   port: process.env.PORT || "3000",

   // 是否启用 Mock
   useMock:
      process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
      process.env.NODE_ENV === "development",

   // 是否为开发环境
   isDev: process.env.NODE_ENV === "development",

   // 是否为生产环境
   isProd: process.env.NODE_ENV === "production",

   // 调试模式
   debug:
      process.env.NEXT_PUBLIC_DEBUG === "true" ||
      process.env.NODE_ENV === "development",
};

// 打印环境信息（仅开发环境）
if (env.isDev && typeof window !== "undefined") {
   console.log("🚀 环境配置:", env);
}
