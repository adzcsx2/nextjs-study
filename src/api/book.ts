import { http } from "@/utils/http";
import { BookQueryType } from "@/types/book";

// 图书相关API
export const bookApi = {
   // 创建图书
   async create(data: BookQueryType) {
      return await http.post("/book", data, {
         showSuccess: true,
         showLoading: true
      });
   },

   // 获取图书列表
   async getList(params?: Record<string, string | number | boolean>) {
      return await http.get("/book/list", params);
   },

   // 获取图书详情
   async getById(id: string | number) {
      return await http.get(`/book/${id}`);
   },

   // 更新图书
   async update(id: string | number, data: Partial<BookQueryType>) {
      return await http.put(`/book/${id}`, data, {
         showSuccess: true
      });
   },

   // 删除图书
   async delete(id: string | number) {
      return await http.delete(`/book/${id}`, {
         showSuccess: true
      });
   },

   // 搜索图书
   async search(keyword: string) {
      return await http.get("/book/search", { keyword });
   }
};

// 保持向后兼容
export const postBook = async (data: BookQueryType) => {
   return await bookApi.create(data);
};
