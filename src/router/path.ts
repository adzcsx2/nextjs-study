export const Path = {
  // 公共路径
  LOGIN: "/login",

  // 主要功能模块
  HOME: "/home",

  // 图书管理模块
  BOOK_MANAGE: "/home/book",
  BOOK_LIST: "/home/book/list",
  BOOK_ADD: "/home/book/add",

  // 借阅管理模块
  BORROW_MANAGE: "/home/borrow",
  BORROW_LIST: "/home/borrow/list",
  BORROW_BOOK: "/home/borrow/book_borrow",

  // 用户管理模块
  USER_PERSONAL_CENTER: (id: string) => `/home/user/personal-center/${id}`,
  USER_LIST: "/home/user/list",
  USER_ADD: "/home/user/add",
  USER_EDIT: (id: string) => `/home/user/personal-center/${id}`,

  // 分类管理模块
  CATEGORY_MANAGE: "/home/category",

  // 动态路由（需要参数）
  NUMBER_DETAIL: "/home/number", // 使用时: /home/number/[number]
} as const;

// 辅助函数：生成带参数的动态路由
export const PathHelper = {
  // 生成编号详情路径
  getNumberDetail: (number: string | number) =>
    `${Path.NUMBER_DETAIL}/${number}`,

  // 如果将来有图书详情页，可以这样扩展
  // getBookDetail: (id: string | number) => `${Path.BOOK_MANAGE}/${id}`,
} as const;
