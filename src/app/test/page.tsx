"use client";
import { useLanguageSwitch } from "@/i18n/hooks";
import { useLoadingStore } from "@/stores/loading";
import { http } from "@/http/http";
import { Button, Divider, Typography } from "antd";
import TestComponent from "./TestComponent";
import { useEffect, useState } from "react";
import { env } from "@/config/env";
import { useTranslation } from "@/i18n/hooks";

const TestPage: React.FC = () => {
  const { t } = useTranslation("common");
  // 使用自定义hooks
  const { switchLanguage } = useLanguageSwitch();

  const [count, setCount] = useState(0);

  return (
    <div className="m-10">
      <h1>{t("测试页面")}</h1>
      <p>{t("这是一个测试")}</p>
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
        }}
      >
        {t("测试eventbus")}
      </Button>
      <Button
        type="primary"
        className="ml-4"
        onClick={() => {
          const a = count + 1;
          setCount(a);
        }}
      >
        {t("测试测试")}
      </Button>
      <Divider />
      <Typography.Text>{t("hello")}</Typography.Text>
      <p>{t("测试")}</p>
      <p>{t("测试aaa")}</p>
      {t("测试")}
      <TestComponent />
      <p>{t("测试ccc")}</p>
      {t("测试")}
      <p>{t("再次测试")}</p>
      {t("阿萨德")}
      <p>{t("你好")}</p>
    </div>
  );
};

export default TestPage;
