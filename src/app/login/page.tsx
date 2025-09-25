"use client";
import { postBook } from "@/api/book";
import { Button, Form, FormProps, Image, Input, Typography } from "antd";
import { use, useEffect, useState } from "react";

type FieldType = {
   username?: string;
   password?: string;
};

export default function Login() {
   const [loginState, setLoginState] = useState({ status: "", message: "" });

   useEffect(() => {
      postBook({ name: "测试", category: "测试", author: "火" }).then(
         (data) => {
            console.log("postBook data:", data);
         }
      );
   }, []);

   const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
      console.log("Success:", values);
      setLoginState({ status: "error", message: "登录失败" });
   };

   const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
      errorInfo
   ) => {
      console.log("Failed:", errorInfo);
      setLoginState({
         status: "error",
         message: errorInfo.errorFields[0].errors[0],
      });
   };
   return (
      <main className="!flex !flex-col !items-center !justify-center !min-h-screen !min-w-screen bg-gray-100">
         <div className="!flex !items-center !justify-center ">
            <Image
               className=" !mr-4"
               src="/logo.svg"
               alt="Logo"
               width={100}
               height={100}
               preview={false}
            />
            <Typography.Title
               level={1}
               className="!text-[#487BD8] !m-0 !leading-none !ml-5"
            >
               图书管理系统
            </Typography.Title>
         </div>

         <Form
            className="!mt-10 !w-120 !justify-center !items-center rounded-lg !p-10 !shadow-lg bg-white"
            name="basic"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
         >
            <Form.Item<FieldType>
               label="账号"
               name="username"
               rules={[{ required: true, message: "请输入账号!" }]}
            >
               <Input className="!w-full" />
            </Form.Item>

            <Form.Item<FieldType>
               label="密码"
               name="password"
               validateStatus={loginState.status === "error" ? "error" : ""}
               help={loginState.message}
               rules={[
                  { required: true, message: "请输入密码!" },
                  { required: false, min: 6, message: "密码至少6位!" },
               ]}
            >
               <Input.Password className="!w-full" />
            </Form.Item>

            <Form.Item label={null}>
               <Button
                  className="!w-full mt-5"
                  type="primary"
                  htmlType="submit"
               >
                  登录
               </Button>
            </Form.Item>
         </Form>
      </main>
   );
}
