"use client";

import { useState } from "react";
import { Button, Card, message, Space, Typography } from "antd";
import { http } from "@/utils/http";

const { Title, Text, Paragraph } = Typography;

interface ApiTestResult {
   success: boolean;
   data?: unknown;
   error?: string;
   timestamp: string;
}

export default function ApiTestPage() {
   const [results, setResults] = useState<ApiTestResult[]>([]);
   const [loading, setLoading] = useState(false);

   // 添加测试结果
   const addResult = (result: Omit<ApiTestResult, "timestamp">) => {
      setResults((prev) => [
         ...prev,
         { ...result, timestamp: new Date().toLocaleTimeString() },
      ]);
   };

   // 测试 GET 请求
   const testGet = async () => {
      setLoading(false);
      try {
         const response = await http.get("/book/list", { page: 1, size: 10 });
         addResult({
            success: true,
            data: response.data || response,
         });
         message.success("GET 请求成功");
      } catch (error) {
         addResult({
            success: false,
            error: error instanceof Error ? error.message : "未知错误",
         });
         message.error("GET 请求失败");
      } finally {
         setLoading(false);
      }
   };

   // 测试 POST 请求
   const testPost = async () => {
      setLoading(true);
      try {
         const testData = {
            title: "测试图书",
            author: "测试作者",
            isbn: "978-0000000000",
         };

         const response = await http.post("/book", testData, {
            showLoading: false, // 避免双重loading
         });

         addResult({
            success: true,
            data: response.data || response,
         });
         message.success("POST 请求成功");
      } catch (error) {
         addResult({
            success: false,
            error: error instanceof Error ? error.message : "未知错误",
         });
         message.error("POST 请求失败");
      } finally {
         setLoading(false);
      }
   };

   // 清除结果
   const clearResults = () => {
      setResults([]);
   };

   return (
      <div className="p-6 max-w-6xl mx-auto">
         <Title level={2}>API 代理测试页面</Title>

         <Paragraph>
            这个页面用于测试 Next.js 代理配置是否正常工作。所有请求都会发送到{" "}
            <Text code>/api/*</Text> 路径， 然后被代理到配置的目标服务器。
         </Paragraph>

         <Card title="代理配置信息" className="mb-6">
            <Space direction="vertical">
               <Text>
                  <strong>客户端请求路径:</strong> <Text code>/api/*</Text>
               </Text>
               <Text>
                  <strong>代理目标:</strong>{" "}
                  <Text code>
                     https://mock.apifox.cn/m1/2398938-0-default/api/*
                  </Text>
               </Text>
               <Text>
                  <strong>当前环境:</strong>{" "}
                  <Text code>{process.env.NODE_ENV}</Text>
               </Text>
            </Space>
         </Card>

         <Card title="API 测试" className="mb-6">
            <Space>
               <Button type="primary" onClick={testGet} loading={loading}>
                  测试 GET 请求
               </Button>
               <Button type="primary" onClick={testPost} loading={loading}>
                  测试 POST 请求
               </Button>
               <Button onClick={clearResults}>清除结果</Button>
            </Space>
         </Card>

         {results.length > 0 && (
            <Card title="测试结果">
               <Space direction="vertical" className="w-full">
                  {results.map((result, index) => (
                     <Card
                        key={index}
                        size="small"
                        type="inner"
                        className={
                           result.success
                              ? "border-green-500 bg-green-50"
                              : "border-red-500 bg-red-50"
                        }
                     >
                        <Space direction="vertical" className="w-full">
                           <div>
                              <Text strong>时间:</Text> {result.timestamp} |
                              <Text
                                 strong
                                 className={
                                    result.success
                                       ? "text-green-600 ml-2"
                                       : "text-red-600 ml-2"
                                 }
                              >
                                 {result.success ? "成功" : "失败"}
                              </Text>
                           </div>

                           {result.success && result.data && (
                              <div>
                                 <Text strong>响应数据:</Text>
                                 <pre className="bg-gray-100 p-2 rounded text-xs max-h-48 overflow-auto">
                                    {JSON.stringify(result.data, null, 2)}
                                 </pre>
                              </div>
                           )}

                           {!result.success && result.error && (
                              <div>
                                 <Text strong>错误信息:</Text>
                                 <Text code className="text-red-600">
                                    {result.error}
                                 </Text>
                              </div>
                           )}
                        </Space>
                     </Card>
                  ))}
               </Space>
            </Card>
         )}

         <Card title="使用说明" className="mt-6">
            <Space direction="vertical">
               <Paragraph>
                  <Text strong>1. 环境配置:</Text> 在{" "}
                  <Text code>.env.local</Text> 中设置{" "}
                  <Text code>PROXY_TARGET</Text> 来改变代理目标。
               </Paragraph>
               <Paragraph>
                  <Text strong>2. 代码使用:</Text> 直接使用相对路径{" "}
                  <Text code>/api/xxx</Text>，Next.js 会自动代理。
               </Paragraph>
               <Paragraph>
                  <Text strong>3. 调试方法:</Text>{" "}
                  打开浏览器开发者工具的网络面板，查看实际的请求地址。
               </Paragraph>
            </Space>
         </Card>
      </div>
   );
}
