# 腾讯云机器翻译配置指南

## 获取腾讯云API密钥

1. **注册腾讯云账号**: https://cloud.tencent.com/
2. **开通机器翻译服务**: https://console.cloud.tencent.com/tmt
3. **获取API密钥**: https://console.cloud.tencent.com/cam/capi

## 密钥格式说明

- **SecretId**: 以 `AKID` 开头，例如：`AKIDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **SecretKey**: 32位字符串，例如：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 配置步骤

1. 复制 `.env.example` 为 `.env.local`
2. 填入你的腾讯云密钥：

```env
TENCENT_SECRET_ID=AKIDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TENCENT_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TENCENT_REGION=ap-beijing
```

## 注意事项

- 密钥文件 `.env.local` 已在 `.gitignore` 中，不会被提交到git
- 腾讯云机器翻译有免费额度：每月前5万字符免费
- 支持的地域：ap-beijing, ap-shanghai, ap-guangzhou 等

## 开通服务

在使用前请确保已开通以下服务：
1. **访问管理 (CAM)** - 用于API密钥管理
2. **机器翻译 (TMT)** - 翻译服务本身

## 测试配置

配置完成后可以运行：

```bash
# 测试单个翻译
npm run translate "测试文本"

# 运行同步
npm run sync-i18n
```

## 常见错误

### SecretId 格式错误
错误：`The SecretId is not found`
解决：确保 SecretId 以 `AKID` 开头

### 服务未开通
错误：`The operation is not supported in this region`
解决：前往控制台开通机器翻译服务

### 额度不足
错误：`Resource package quota is not enough`
解决：检查账户余额或购买资源包

## 备用方案

如果暂时无法配置腾讯云API，系统会使用本地词典进行基础翻译。