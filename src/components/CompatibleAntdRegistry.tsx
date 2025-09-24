// 专门用于确保 React 19 兼容性的 Ant Design 包装组件
'use client';

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';

// 在组件定义之前立即应用补丁
import '@ant-design/v5-patch-for-react-19';

interface CompatibleAntdRegistryProps {
  children: React.ReactNode;
}

export function CompatibleAntdRegistry({ children }: CompatibleAntdRegistryProps) {
  return <AntdRegistry>{children}</AntdRegistry>;
}