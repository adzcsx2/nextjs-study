"use client";
import { useLanguageSwitch } from "@/i18n/hooks";
import { useLoadingStore } from "@/stores/loading";
import { http } from "@/http/http";
import { Button, Divider, Typography } from "antd";
import { useTranslation } from "react-i18next";
import TestComponent from "./TestComponent";
import { useEffect, useState } from "react";
import { eventBus } from "@/eventbus/eventBus";
import { env } from "@/config/env";

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
        {t("中文")}
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
        {t("测试请求")}
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
        {t("显示loading")}
      </Button>
      <Button
        type="primary"
        className="ml-4"
        onClick={() => {
          // 使用多种输出方式确保能看到日志
          console.log("bbb - 测试环境日志");
          console.info(t("环境信息:"), {
            NODE_ENV: env.node_env,
            ENV_NAME: env.envName,
            IS_PROD: env.isProd,
            IS_DEV: env.isDev,
          });

          // 使用 alert 确保能看到输出
          alert(`当前环境: ${env.node_env} | ENV_NAME: ${env.envName}`);

          useLoadingStore.getState().setLoading(false);
        }}
      >
        {t("取消loading")}
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
        {t("测试eventBus {count}")}
      </Button>

      <Divider />
      <Typography.Text>{t("hello")}</Typography.Text>

      <TestComponent />
    </div>
  );
};

export default TestPage;
