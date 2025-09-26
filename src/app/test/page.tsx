"use client";
import { useLanguageSwitch } from "@/i18n/hooks";
import { useLoadingStore } from "@/stores/loading";
import { http } from "@/http/http";
import { Button, Divider, Typography } from "antd";
import { useTranslation } from "react-i18next";
import TestComponent from "./TestComponent";
import { useEffect, useState } from "react";
import { eventBus } from "@/eventBus/eventBus";

const TestPage: React.FC = () => {
   const { t } = useTranslation("common");
   // 使用自定义hooks
   const { switchLanguage } = useLanguageSwitch();

   const [count, setCount] = useState(0);

   return (
      <div className="m-10">
         <Button
            type="primary"
            onClick={() => {
               switchLanguage("zh");
            }}
         >
            中文
         </Button>
         <Button
            type="primary"
            className="ml-4"
            onClick={() => {
               switchLanguage("en");
            }}
         >
            English
         </Button>
         <Button
            type="primary"
            className="ml-4"
            onClick={() => {
               http.get("/api/books").then((data) => {
                  console.log(data);
               });
            }}
         >
            测试请求
         </Button>

         <Button
            type="primary"
            className="ml-4"
            onClick={() => {
               console.log("aaaa");
               import("@/stores/loading")
                  .then(({ useLoadingStore }) =>
                     useLoadingStore.getState().setLoading(true, "aaaa")
                  )
                  .catch((error) =>
                     console.warn("Loading store not available:", error)
                  );
            }}
         >
            显示loading
         </Button>
         <Button
            type="primary"
            className="ml-4"
            onClick={() => {
               useLoadingStore.getState().setLoading(false);
            }}
         >
            取消loading
         </Button>
         <Button
            type="primary"
            className="ml-4"
            onClick={() => {
               const a = count + 1;
               setCount(a);
               eventBus.emit("testCount", count);
            }}
         >
            测试eventBus {count}
         </Button>

         <Divider />
         <Typography.Text>{t("hello")}</Typography.Text>

         <TestComponent />
      </div>
   );
};

export default TestPage;
