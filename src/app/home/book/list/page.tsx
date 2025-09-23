"use client";
import { Button, Input, Select, Table, TableProps } from "antd";
import { useState } from "react";
import { BookType } from "@/types/book";
export default function Book() {
   const [options, setOptions] = useState([]);
   const [books, setBooks] = useState<BookType[]>([]);

   const columns: TableProps<BookType>["columns"] = [
      {
         title: "名称",
         dataIndex: "name",
         key: "name",
         render: (text) => <a>{text}</a>,
      },
      {
         title: "封面",
         dataIndex: "cover",
         key: "cover",
         render: (text) => <a>{text}</a>,
      },
      {
         title: "作者",
         dataIndex: "author",
         key: "author",
      },
      {
         title: "分类",
         dataIndex: "type",
         key: "type",
      },
      {
         title: "库存",
         dataIndex: "in_stock",
         key: "in_stock",
      },
      {
         title: "创建时间",
         dataIndex: "creation_time",
         key: "creation_time",
      },
   ];

   return (
      <div>
         <div className="flex flex-vertical space-x-4 items-center">
            <p className="!flex-1 flex justify-center  ">名称</p>
            <Input
               className="!flex-3  flex justify-center"
               placeholder="请输入书籍名称"
            />
            <p className="!flex-1 flex justify-center">作者</p>
            <Input
               className="!flex-3 flex justify-center "
               placeholder="请输入"
            />
            <p className="!flex-1 flex justify-center">分类</p>
            <Select
               className="!flex-3 !mr-4 "
               showSearch
               placeholder="请选择"
               optionFilterProp="label"
               onChange={() => {}}
               onSearch={() => {}}
               options={options}
            />
            <Button type="primary">搜索</Button>
            <Button>清空</Button>
         </div>
         <Table<BookType>
            className="mt-5"
            columns={columns}
            dataSource={books}
         />
      </div>
   );
}
