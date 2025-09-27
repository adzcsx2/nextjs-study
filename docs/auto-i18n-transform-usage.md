# 自动i18n转换工具使用说明

## 功能说明

这个工具可以自动处理React/Next.js项目中的国际化转换，主要功能包括：

1. **自动替换语法**：将 `t"字符串"` 替换为 `t("字符串")`
2. **自动导包**：自动添加 `useTranslation` hook 的导入
3. **自动声明变量**：在组件中自动添加 `const { t } = useTranslation("common");`
4. **自动更新翻译文件**：在 `common.ts` 中自动添加缺失的键值对

## 使用方法

### 1. 处理整个项目
```bash
npm run i18n:transform
# 或者
node scripts/auto-i18n-transform.mjs
```

### 2. 处理单个文件
```bash
npm run i18n:transform:file src/app/login/page.tsx
# 或者
node scripts/auto-i18n-transform.mjs --file src/app/login/page.tsx
```

## 转换示例

### 转换前
```tsx
export default function Login() {
   return (
      <div>
         <h1>{t"登录"}</h1>
         <p>{t"请输入用户名和密码"}</p>
      </div>
   );
}
```

### 转换后
```tsx
import { useTranslation } from "@/i18n/hooks";

export default function Login() {
   const { t } = useTranslation("common");
   
   return (
      <div>
         <h1>{t("登录")}</h1>
         <p>{t("请输入用户名和密码")}</p>
      </div>
   );
}
```

同时会在 `src/i18n/lang/zh/common.ts` 和 `src/i18n/lang/en/common.ts` 中自动添加：
```typescript
export default {
   // ...existing keys...
   
   // 自动添加的翻译
   登录: "登录",
   请输入用户名和密码: "请输入用户名和密码",
}
```

## 注意事项

1. **备份文件**：建议在运行脚本前备份你的代码
2. **检查结果**：运行后请检查生成的代码是否符合预期
3. **英文翻译**：脚本会为英文翻译文件添加相同的值，你可能需要手动翻译
4. **键名生成**：脚本使用简单的策略生成键名，复杂情况可能需要手动调整

## 支持的文件类型

- `.tsx`
- `.ts` 
- `.jsx`
- `.js`

## 排除的目录

- `node_modules`
- `.next`
- `dist`
- `.git`