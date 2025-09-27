"use client";
import { Button, Form, FormProps, Image, Input, Typography } from "antd";
import { use, useEffect, useState } from "react";

import { api } from "@/api/api";
import { loginReq } from "@/types/login";
import { useTranslation } from "@/i18n/hooks";

export default function Login() {
   const { t } = useTranslation("common");

   const [loginState, setLoginState] = useState({ status: "", message: "" });

   const onFinish: FormProps<loginReq>["onFinish"] = (values) => {
      api.login(values).then((data) => {
         console.log("postLogin data:", data);
         if (data.code === 200) {
            // 登录成功
            setLoginState({
               status: "success",
               message: t("登录成功"),
            });
         } else {
            // // 登录失败，但不会抛出未捕获错误
            // setLoginState({
            //    status: "error",
            //    message: data.message || "登录失败",
            // });
         }
      });

      console.log("Success:", values);
   };

   const onFinishFailed: FormProps<loginReq>["onFinishFailed"] = (
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
               {t("图书管理系统")}
            </Typography.Title>
         </div>

         <Form
            className=")!mt-10 !w-120 !justify-center !items-center rounded-lg !p-10 !shadow-lg bg-white"
            name="basic"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
         >
            <Form.Item<loginReq>
               label={t("账号")}
               name="username"
               rules={[{ required: true, message: t("请输入账号!") }]}
            >
               <Input className="!w-fullt(" />
            </Form.Item>

            <Form.Item<loginReq>
               label={t("密码")}
               name="password"
               validateStatus={loginState.status === "error" ? "error" : ""}
               help={loginState.message}
               rules={[
                  { required: true, message: t("请输入密码") },
                  { required: false, min: 6, message: t("密码至少6位!") },
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
                  {t("登录")}
               </Button>
            </Form.Item>
         </Form>
      </main>
   );
}
