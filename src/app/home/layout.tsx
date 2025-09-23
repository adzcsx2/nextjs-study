"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Icon, {
   AuditOutlined,
   BookOutlined,
   LaptopOutlined,
   LayoutOutlined,
   NotificationOutlined,
   UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout as AntdLayout, Menu, theme } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { usePathname, useRouter } from "next/navigation";
import { icons } from "antd/es/image/PreviewGroup";
const { Header, Content, Footer, Sider } = AntdLayout;

const items1: MenuProps["items"] = ["1", "2", "3"].map((key) => ({
   key,
   label: `nav ${key}`,
}));

const items2: MenuProps["items"] = [
   UserOutlined,
   LaptopOutlined,
   NotificationOutlined,
].map((icon, index) => {
   const key = String(index + 1);

   return {
      key: `sub${key}`,
      icon: React.createElement(icon),
      label: `subnav ${key}`,
      children: Array.from({ length: 4 }).map((_, j) => {
         const subKey = index * 4 + j + 1;
         return {
            key: subKey,
            label: `option${subKey}`,
         };
      }),
   };
});

const ITEM = [
   {
      key: "book",
      label: "图书管理",
      icon: <BookOutlined />,
      children: [
         { key: "/home/book/list", label: "图书列表" },
         { key: "/home/book/add", label: "图书添加" },
      ],
   },
   {
      key: "borrow",
      label: "借阅管理",
      icon: <AuditOutlined />,
      children: [
         { key: "/home/borrow/list", label: "借阅列表" },
         { key: "/home/borrow/book_borrow", label: "书籍借阅" },
      ],
   },
   {
      key: "/home/category",
      label: "分类管理",
      icon: <LayoutOutlined />,
   },
   {
      key: "user",
      label: "用户管理",
      icon: <UserOutlined />,
      children: [
         { key: "/home/user/list", label: "用户列表" },
         { key: "/home/user/add", label: "用户添加" },
      ],
   },
];

function HomeLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   const router = useRouter();
   const pathname = usePathname(); // 获取当前路径
   const [label, setLabel] = useState("");

   useEffect(() => {
      //初始化路由页面
      if (pathname === "/home") {
         const firstChild = ITEM[0]?.children?.[0];
         if (firstChild) {
            const key = firstChild.key as string;
            router.push(key);
         }
      }
      getCurrentLabel(pathname);
   }, [pathname]);
   function getCurrentLabel(key: string) {
      ITEM.forEach((item) => {
         if (item.children) {
            item.children?.forEach((child) => {
               if (child.key === key) {
                  setLabel(child.label as string);
               }
            });
         } else {
            if (item.key === key) {
               setLabel(item.label as string);
            }
         }
      });
   }
   return (
      <AntdLayout className="w-full min-h-screen flex flex-col ">
         <Header className="h-full !bg-white h-16 flex align-middle">
            <div className="flex items-center ">
               <Image src="/logo.svg" width={30} height={30} alt="Logo" />
               <span className="ml-2 text-blue-400 text-xl font-bold">
                  三木图书管理系统
               </span>
            </div>
            <div className=" ml-auto">登录</div>
         </Header>
         <div className=" !flex-1 !w-full mt-0.5  ">
            <AntdLayout className="h-full flex flex-col">
               <Sider width={200}>
                  <Menu
                     mode="inline"
                     defaultSelectedKeys={[pathname]}
                     defaultOpenKeys={["book", "borrow", "user"]}
                     style={{ height: "100%" }}
                     items={ITEM}
                     onSelect={({ key }) => {
                        router.push(key);
                     }}
                  />
               </Sider>
               <Content className="p-10 h-full flex flex-col flex-1">
                  <p className="text-4xl ">{label}</p>
                  <div className="rounded-lg  p-5  bg-white mt-5 h-full ">
                     {children}
                  </div>
               </Content>
            </AntdLayout>
         </div>
      </AntdLayout>
   );
}

export default HomeLayout;
