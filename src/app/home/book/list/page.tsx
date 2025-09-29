"use client";
import { Button, Input, Select, Table, TableProps } from "antd";
import { useEffect, useState } from "react";
import { BookType } from "@/types/book";
import { useTranslation } from "@/i18n/hooks";
export default function Book() {
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [books, setBooks] = useState<BookType[]>([]);

  useEffect(() => {
    console.log("options", t("啊啊啊"));
  }, []);

  const columns: TableProps<BookType>["columns"] = [
    {
      title: t("名称"),
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: t("封面"),
      dataIndex: "cover",
      key: "cover",
      render: (text) => <a>{text}</a>,
    },
    {
      title: t("作者"),
      dataIndex: "author",
      key: "author",
    },
    {
      title: t("分类"),
      dataIndex: "type",
      key: "type",
    },
    {
      title: t("库存"),
      dataIndex: "in_stock",
      key: "in_stock",
    },
    {
      title: t("创建时间"),
      dataIndex: "creation_time",
      key: "creation_time",
    },
  ];

  return (
    <div>
      <div className="flex flex-vertical space-x-4 items-center">
        <p className="!flex-1 flex justify-center  ">{t("名称")}</p>
        <Input
          className="!flex-3  flex justify-center"
          placeholder={t("请输入书籍名称")}
        />
        <p className="!flex-1 flex justify-center">{t("作者")}</p>
        <Input
          className="!flex-3 flex justify-center "
          placeholder={t("请输入")}
        />
        <p className="!flex-1 flex justify-center">{t("分类")}</p>
        <Select
          className="!flex-3 !mr-4 "
          showSearch
          placeholder={t("请选择")}
          optionFilterProp="label"
          onChange={() => {}}
          onSearch={() => {}}
          options={options}
        />
        <Button type="primary">{t("搜索")}</Button>
        <Button>{t("清空")}</Button>
      </div>
      <Table<BookType> className="mt-5" columns={columns} dataSource={books} />
    </div>
  );
}
