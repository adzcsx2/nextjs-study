"use client";
import { Button, Input, Select, Table, TableProps } from "antd";
import { useEffect, useState } from "react";
import { BookListReq, BookType } from "@/types/book";
import { useTranslation } from "@/i18n/hooks";
import { api } from "@/api/api";
import typography from "antd/es/typography";
import Image from "antd/es/image";
import timeUtils from "@/utils/timeUtils";

export default function Book() {
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);

  const [bookList, setBookList] = useState<BookType[]>([]);
  
  useEffect(() => {
    const req: BookListReq = {};
    api.getBookList(req).then((res) => {
      setBookList(res || []);
    });
  }, []);

  const columns: TableProps<BookType>["columns"] = [
    {
      title: t("名称"),
      dataIndex: "name",
      key: "name",
      render: (text) => <typography.Text>{text}</typography.Text>,
    },
    {
      title: t("封面"),
      dataIndex: "cover",
      key: "cover",
      render: () => (
        <Image
          src="https://www.szjlc.cn/nw/thumbnail/8613816169529511936"
          alt="cover"
          width={50}
          height={70}
        />
      ),
    },
    {
      title: t("作者"),
      dataIndex: "author",
      key: "author",
      render: (text) => <typography.Text>{text}</typography.Text>,
    },
    {
      title: t("分类"),
      dataIndex: "category",
      key: "category",
      render: (text) => <typography.Text>-</typography.Text>,
    },
    {
      title: t("库存"),
      dataIndex: "stock",
      key: "stock",
      render: (text) => <typography.Text>{text}</typography.Text>,
    },
    {
      title: t("创建时间"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <typography.Text>{timeUtils.format(text)}</typography.Text>
      ),
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
      <Table<BookType>
        className="mt-5"
        columns={columns}
        dataSource={bookList}
        rowKey="_id"
      />
    </div>
  );
}
