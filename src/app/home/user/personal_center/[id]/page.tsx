"use client";
import React, { use, useEffect } from "react";
import { Button, Checkbox, Form, Input, message, Radio } from "antd";
import { User } from "@/types/user";
import { api } from "@/api/api";
export default function Personal_Center({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = use(params).id;
  const [user, setUser] = React.useState<User | null>(null);
  const [form] = Form.useForm();
  useEffect(() => {
    api.getUserInfo(userId).then((data: User | null) => {
      setUser(data);
      console.log(data);
      if (data) {
        // populate form fields when async data arrives
        form.setFieldsValue({
          nickName: data.nickName,
          userName: data.name,
          status: data.status,
        });
      }
    });
  }, [userId, form]);

  return (
    <main className="items-center justify-center">
      <Form
        form={form}
        className="!flex !flex-col !items-center !justify-center !mt-10 "
        style={{ width: "100%" }}
        labelCol={{ span: 51 }}
        wrapperCol={{ span: 21 }}
        layout="horizontal"
        onFinish={(values) => {
          console.log(values);
          message.success("保存成功");
        }}
        onFinishFailed={(err) => {
          console.log(err);
        }}
      >
        <Form.Item
          label="账号:"
          name={"userName"}
          rules={[{ required: true, message: "请输入账号!" }]}
        >
          <Input placeholder="用户登录的账号" />
        </Form.Item>
        <Form.Item
          label="昵称:"
          name={"nickName"}
          rules={[{ required: true, message: "请输入昵称!" }]}
        >
          <Input placeholder="用户昵称" />
        </Form.Item>
        <Form.Item label="性别:">
          <Radio.Group defaultValue={"male"}>
            <Radio value="male">男</Radio>
            <Radio value="female">女</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="密码:">
          <Input.Password placeholder="请输入密码" />
        </Form.Item>

        <Form.Item label="状态:" name={"status"}>
          <Radio.Group>
            <Radio value="on">启用</Radio>
            <Radio value="off">禁用</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="角色:">
          <Radio.Group defaultValue={"admin"}>
            <Radio value="admin">管理员</Radio>
            <Radio value="user">用户</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form.Item>
      </Form>
    </main>
  );
}
