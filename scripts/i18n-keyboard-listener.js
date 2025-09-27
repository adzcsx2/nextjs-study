// eslint-disable-next-line
const https = require("https");
// eslint-disable-next-line
const crypto = require("crypto");
// eslint-disable-next-line
const path = require("path");
// eslint-disable-next-line
const fs = require("fs");
// eslint-disable-next-line
const readline = require("readline");
// eslint-disable-next-line
const { exec } = require("child_process");

/**
 * 自动文件监听和处理工具
 *
 * 功能：
 * 1. 每10秒自动检测最近10秒内修改的文件
 * 2. 自动处理文件中所有包含中文的字符串
 * 3. 自动替换为 t() 格式
 * 4. 保存到 common.ts 并翻译
 */

class AutoFileProcessor {
   constructor() {
      this.processor = new ChineseStringProcessor();
      this.syncer = null; // 暂时禁用翻译同步
      this.isRunning = false;
      this.intervalId = null;
      this.processedFiles = new Set(); // 避免重复处理同一个文件
      this.lastProcessTime = new Map(); // 记录文件上次处理时间
   }

   /**
    * 启动自动监听
    */
   start() {
      this.isRunning = true;

      console.log("🎯 自动文件处理器已启动");
      console.log("");
      console.log("功能说明:");
      console.log("  • 每10秒自动检测文件变化");
      console.log("  • 处理最近10秒内修改的文件");
      console.log("  • 自动替换中文字符串为 t() 函数");
      console.log("  • 只处理 .tsx, .ts, .jsx, .js 文件");
      console.log("");

      // 立即执行一次
      this.checkAndProcessFiles();

      // 每10秒执行一次
      this.intervalId = setInterval(() => {
         this.checkAndProcessFiles();
      }, 10000);

      console.log("🔄 监听已开始，每10秒检查一次文件变化...");
   }

   /**
    * 检查并处理文件
    */
   async checkAndProcessFiles() {
      try {
         const changedFiles = this.findRecentlyChangedFiles();

         if (changedFiles.length === 0) {
            // console.log(`⏰ ${new Date().toLocaleTimeString()} - 无文件变化`);
            return;
         }

         console.log(
            `\n🔍 ${new Date().toLocaleTimeString()} - 发现 ${
               changedFiles.length
            } 个文件有变化:`
         );
         changedFiles.forEach((file) => {
            console.log(`  📄 ${path.relative(process.cwd(), file)}`);
         });

         // 处理每个文件
         for (const filePath of changedFiles) {
            await this.processFileIfNeeded(filePath);
         }
      } catch (error) {
         console.error(`❌ 检查文件时出错: ${error.message}`);
      }
   }

   /**
    * 查找最近10秒内修改的文件
    */
   findRecentlyChangedFiles() {
      const changedFiles = [];
      const tenSecondsAgo = Date.now() - 10 * 1000;
      const srcDir = path.join(process.cwd(), "src");

      if (!fs.existsSync(srcDir)) {
         return changedFiles;
      }

      const searchFiles = (dir) => {
         try {
            const items = fs.readdirSync(dir);

            for (const item of items) {
               const itemPath = path.join(dir, item);
               const stat = fs.statSync(itemPath);

               if (stat.isDirectory()) {
                  // 排除 i18n 文件夹
                  if (item !== "i18n") {
                     // 递归搜索子目录
                     searchFiles(itemPath);
                  }
               } else if (stat.isFile()) {
                  const ext = path.extname(item);
                  // 只处理相关文件类型
                  if ([".tsx", ".ts", ".jsx", ".js"].includes(ext)) {
                     // 检查文件是否在最近10秒内被修改
                     if (stat.mtime.getTime() > tenSecondsAgo) {
                        changedFiles.push(itemPath);
                     }
                  }
               }
            }
         } catch (error) {
            // 忽略权限错误等
         }
      };

      searchFiles(srcDir);
      return changedFiles;
   }

   /**
    * 如果需要则处理文件
    */
   async processFileIfNeeded(filePath) {
      try {
         // 检查是否需要处理此文件
         const stats = fs.statSync(filePath);
         const lastModified = stats.mtime.getTime();
         const lastProcessed = this.lastProcessTime.get(filePath) || 0;

         // 如果文件在上次处理后没有修改，跳过
         if (lastModified <= lastProcessed) {
            return;
         }

         console.log(
            `\n🔄 处理文件: ${path.relative(process.cwd(), filePath)}`
         );

         // 读取文件内容
         let content = fs.readFileSync(filePath, "utf8");
         const originalContent = content;

         // 提取中文字符串
         const chineseStrings = this.processor.extractChineseStrings(content);

         if (chineseStrings.length === 0) {
            console.log("📝 未发现需要处理的中文字符串");
            this.lastProcessTime.set(filePath, Date.now());
            return;
         }

         console.log(`📋 发现 ${chineseStrings.length} 个中文字符串:`);
         chineseStrings.forEach((str, index) => {
            if (str.length <= 30) {
               // 只显示较短的字符串
               console.log(`  ${index + 1}. "${str}"`);
            }
         });

         // 替换中文字符串
         content = this.processor.replaceChineseStrings(
            content,
            chineseStrings
         );

         // 确保导入了 useTranslation
         content = this.ensureUseTranslationImport(content);

         // 确保有 t 函数声明
         content = this.ensureTFunctionDeclaration(content);

         // 只有内容发生变化才写入文件
         if (content !== originalContent) {
            fs.writeFileSync(filePath, content, "utf8");
            console.log("✅ 文件内容已更新");
         }

         // 更新 common.ts 文件
         console.log(
            `🔧 准备更新 common.ts，字符串数量: ${chineseStrings.length}`
         );
         chineseStrings.forEach((str, index) => {
            console.log(`  ${index + 1}. "${str}"`);
         });
         const updateResult = this.processor.updateCommonFile(chineseStrings);
         console.log(`🔧 updateCommonFile 返回结果: ${updateResult}`);

         // 同步翻译（如果配置了API）
         if (this.syncer) {
            await this.syncer.syncTranslations(chineseStrings);
         }

         // 记录处理时间
         this.lastProcessTime.set(filePath, Date.now());
         console.log("🎉 文件处理完成！");
      } catch (error) {
         console.error(`❌ 处理文件 ${filePath} 时出错: ${error.message}`);
      }
   }

   /**
    * 确保导入了 useTranslation
    */
   ensureUseTranslationImport(content) {
      if (
         content.includes("useTranslation") &&
         content.includes("@/i18n/hooks")
      ) {
         return content;
      }

      const lines = content.split("\n");
      let importIndex = -1;

      for (let i = 0; i < lines.length; i++) {
         if (
            lines[i].trim().startsWith("import ") &&
            !lines[i].includes("//")
         ) {
            importIndex = i;
         }
      }

      if (importIndex !== -1) {
         lines.splice(
            importIndex + 1,
            0,
            'import { useTranslation } from "@/i18n/hooks";'
         );
      }

      return lines.join("\n");
   }

   /**
    * 确保有 t 函数声明
    */
   ensureTFunctionDeclaration(content) {
      if (content.includes("const { t } = useTranslation")) {
         return content;
      }

      // 找到函数组件的开始位置
      const functionMatch = content.match(
         /(function\s+\w+|const\s+\w+\s*=|export\s+default\s+function)/
      );
      if (!functionMatch) {
         return content;
      }

      const functionStart = functionMatch.index + functionMatch[0].length;

      return (
         content.slice(0, functionStart) +
         '\n   const { t } = useTranslation("common");\n' +
         content.slice(functionStart)
      );
   }

   /**
    * 停止监听
    */
   stop() {
      console.log("\n🛑 自动文件处理器已停止");
      this.isRunning = false;

      if (this.intervalId) {
         clearInterval(this.intervalId);
         this.intervalId = null;
      }
   }
}

// 手动加载环境变量
function loadEnvVariables() {
   const envFiles = [".env.local", ".env"];

   for (const envFile of envFiles) {
      const envPath = path.join(__dirname, "..", envFile);
      if (fs.existsSync(envPath)) {
         const envContent = fs.readFileSync(envPath, "utf8");
         const envLines = envContent.split("\n");

         for (const line of envLines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith("#")) {
               const [key, ...valueParts] = trimmedLine.split("=");
               if (key && valueParts.length > 0) {
                  const value = valueParts.join("=");
                  process.env[key] = value;
               }
            }
         }
         break;
      }
   }
}

// 加载环境变量
loadEnvVariables();

/**
 * 腾讯翻译API
 */
class TencentTranslator {
   constructor(secretId, secretKey, region = "ap-beijing") {
      this.secretId = secretId;
      this.secretKey = secretKey;
      this.region = region;
      this.endpoint = "tmt.tencentcloudapi.com";
      this.service = "tmt";
      this.version = "2018-03-21";
      this.action = "TextTranslate";
   }

   hmacSha256(key, data) {
      return crypto.createHmac("sha256", key).update(data, "utf8").digest();
   }

   getDate(timestamp) {
      const date = new Date(timestamp * 1000);
      const year = date.getUTCFullYear();
      const month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
      const day = ("0" + date.getUTCDate()).slice(-2);
      return `${year}-${month}-${day}`;
   }

   generateSignature(payload, timestamp) {
      const date = this.getDate(timestamp);

      const httpRequestMethod = "POST";
      const canonicalUri = "/";
      const canonicalQueryString = "";
      const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${this.endpoint}\n`;
      const signedHeaders = "content-type;host";
      const hashedRequestPayload = crypto
         .createHash("sha256")
         .update(payload)
         .digest("hex");

      const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;

      const algorithm = "TC3-HMAC-SHA256";
      const credentialScope = `${date}/${this.service}/tc3_request`;
      const hashedCanonicalRequest = crypto
         .createHash("sha256")
         .update(canonicalRequest)
         .digest("hex");

      const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

      const kDate = this.hmacSha256(`TC3${this.secretKey}`, date);
      const kService = this.hmacSha256(kDate, this.service);
      const kSigning = this.hmacSha256(kService, "tc3_request");
      const signature = this.hmacSha256(kSigning, stringToSign).toString("hex");

      const authorization = `${algorithm} Credential=${this.secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

      return authorization;
   }

   async translate(text, from = "zh", to = "en") {
      if (!this.secretId || !this.secretKey) {
         throw new Error("腾讯翻译 API 配置缺失");
      }

      if (!this.secretId.startsWith("AKID")) {
         throw new Error("TENCENT_SECRET_ID 格式错误");
      }

      const timestamp = Math.floor(Date.now() / 1000);

      const payload = JSON.stringify({
         SourceText: text,
         Source: from,
         Target: to,
         ProjectId: 0,
      });

      const authorization = this.generateSignature(payload, timestamp);

      const options = {
         hostname: this.endpoint,
         port: 443,
         path: "/",
         method: "POST",
         headers: {
            Authorization: authorization,
            "Content-Type": "application/json; charset=utf-8",
            Host: this.endpoint,
            "X-TC-Action": this.action,
            "X-TC-Timestamp": timestamp.toString(),
            "X-TC-Version": this.version,
            "X-TC-Region": this.region,
         },
      };

      return new Promise((resolve, reject) => {
         const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
               try {
                  const result = JSON.parse(data);
                  if (result.Response && result.Response.Error) {
                     reject(
                        new Error(
                           `腾讯翻译 API 错误: ${result.Response.Error.Message}`
                        )
                     );
                  } else if (result.Response && result.Response.TargetText) {
                     resolve(result.Response.TargetText);
                  } else {
                     reject(new Error(`意外的API响应格式`));
                  }
               } catch (error) {
                  reject(new Error(`解析响应失败: ${error.message}`));
               }
            });
         });

         req.on("error", (error) => {
            reject(new Error(`网络请求失败: ${error.message}`));
         });
         req.write(payload);
         req.end();
      });
   }
}

/**
 * 智能翻译器
 */
class SmartTranslator {
   constructor() {
      this.apiTranslator = new TencentTranslator(
         process.env.TENCENT_SECRET_ID || "",
         process.env.TENCENT_SECRET_KEY || "",
         process.env.TENCENT_REGION || "ap-beijing"
      );

      // 并发控制
      this.maxConcurrency = 1;
      this.requestWindow = 1000;
      this.requestQueue = [];
      this.activeRequests = 0;

      // 本地词典映射
      this.localMappings = {
         你好: "Hello",
         谢谢: "Thank you",
         再见: "Goodbye",
         是: "Yes",
         否: "No",
         用户: "User",
         密码: "Password",
         登录: "Login",
         退出: "Logout",
         保存: "Save",
         取消: "Cancel",
         确定: "Confirm",
         删除: "Delete",
         编辑: "Edit",
         新增: "Add",
         修改: "Modify",
         查看: "View",
         搜索: "Search",
         提交: "Submit",
         重置: "Reset",
         返回: "Back",
         下一步: "Next",
         上一步: "Previous",
         完成: "Complete",
         开始: "Start",
         结束: "End",
         成功: "Success",
         失败: "Failed",
         错误: "Error",
         警告: "Warning",
         信息: "Information",
         帮助: "Help",
         关于: "About",
         设置: "Settings",
         配置: "Configuration",
         管理: "Management",
         系统: "System",
         数据: "Data",
         文件: "File",
         上传: "Upload",
         下载: "Download",
         导入: "Import",
         导出: "Export",
         打印: "Print",
         预览: "Preview",
         欢迎使用: "Welcome to use",
         操作成功: "Operation successful",
         操作失败: "Operation failed",
         请输入: "Please enter",
         请选择: "Please select",
         确认删除: "Confirm deletion",
         暂无数据: "No data",
         加载中: "Loading",
         请稍候: "Please wait",
         网络错误: "Network error",
         服务器错误: "Server error",
         权限不足: "Insufficient permissions",
         登录过期: "Login expired",
         密码错误: "Password incorrect",
         用户不存在: "User does not exist",
      };
   }

   localTranslate(text) {
      if (this.localMappings[text]) {
         return this.localMappings[text];
      }

      let result = text;
      for (const [zh, en] of Object.entries(this.localMappings)) {
         if (text.includes(zh)) {
            result = result.replace(new RegExp(zh, "g"), en);
         }
      }

      if (result === text) {
         return `[翻译失败: ${text}]`;
      }

      return result;
   }

   async translate(text, useAPI = true) {
      if (
         useAPI &&
         this.apiTranslator.secretId &&
         this.apiTranslator.secretId.startsWith("AKID")
      ) {
         try {
            const result = await this.controlledTranslate(text);
            if (result && !result.startsWith("[翻译失败")) {
               this.localMappings[text] = result;
               return result;
            }
         } catch (error) {
            console.warn(`API翻译失败，降级到本地翻译: ${error.message}`);
         }
      }

      return this.localTranslate(text);
   }

   async controlledTranslate(text) {
      return new Promise((resolve, reject) => {
         this.requestQueue.push({
            text,
            resolve,
            reject,
            timestamp: Date.now(),
         });
         this.processQueue();
      });
   }

   processQueue() {
      const now = Date.now();
      this.requestQueue = this.requestQueue.filter(
         (req) => now - req.timestamp < this.requestWindow
      );

      if (this.activeRequests >= this.maxConcurrency) {
         return;
      }

      if (this.requestQueue.length > 0) {
         const request = this.requestQueue.shift();
         this.activeRequests++;

         this.apiTranslator
            .translate(request.text)
            .then((result) => {
               this.activeRequests--;
               request.resolve(result);
               setTimeout(() => this.processQueue(), 100);
            })
            .catch((error) => {
               this.activeRequests--;
               request.reject(error);
               setTimeout(() => this.processQueue(), 100);
            });
      }
   }
}

/**
 * i18n 文件同步器
 */
class I18nSyncer {
   constructor() {
      this.translator = new SmartTranslator();
      this.cacheDir = path.join(__dirname, "..", ".i18n-cache");
      this.zhDir = path.join(__dirname, "..", "src", "i18n", "lang", "zh");
      this.enDir = path.join(__dirname, "..", "src", "i18n", "lang", "en");
      this.maxConcurrency = 3;
      this.activeTranslations = 0;
      this.translationQueue = [];
      this.initCacheDir();
   }

   generateSafeKey(str) {
      return `"${str}"`;
   }

   initCacheDir() {
      if (!fs.existsSync(this.cacheDir)) {
         fs.mkdirSync(this.cacheDir, { recursive: true });
      }
   }

   parseI18nFile(filePath) {
      try {
         const content = fs.readFileSync(filePath, "utf8");
         const exportMatch = content.match(
            /export\s+default\s+({[\s\S]*})\s*;?\s*$/
         );

         if (!exportMatch) {
            console.error(`❌ 无法解析文件格式: ${filePath}`);
            return {};
         }

         const objectStr = exportMatch[1];
         const obj = eval(`(${objectStr})`);
         return obj;
      } catch (error) {
         console.error(`❌ 解析文件失败: ${filePath}`, error.message);
         return {};
      }
   }

   objectToTsString(obj, indent = 3) {
      const lines = [];
      const spaces = " ".repeat(indent);

      for (const [key, value] of Object.entries(obj)) {
         if (typeof value === "string") {
            const escapedValue = value
               .replace(/"/g, '\\"')
               .replace(/\n/g, "\\n");
            const safeKey = this.generateSafeKey(key);
            lines.push(`${spaces}${safeKey}: "${escapedValue}",`);
         }
      }

      return lines.join("\n");
   }

   async translateWithRetry(text, maxRetries = 5, retryDelay = 8000) {
      let lastError;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
         try {
            const result = await this.translator.translate(text);
            if (result && !result.startsWith("[翻译失败:")) {
               return result;
            }
            throw new Error(`翻译结果无效: ${result}`);
         } catch (error) {
            lastError = error;

            if (attempt === maxRetries) {
               throw new Error(
                  `经过 ${maxRetries} 次尝试后翻译失败: ${error.message}`
               );
            }

            console.warn(
               `⚠️ 翻译失败 (第 ${attempt}/${maxRetries} 次): ${error.message}`
            );
            console.log(`⏳ ${retryDelay / 1000} 秒后重试...`);

            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            console.log(`🔄 重试翻译 (第 ${attempt + 1} 次): "${text}"`);
         }
      }

      throw lastError;
   }

   async translateBatch(translationTasks) {
      console.log(
         `🔧 使用线程池处理 ${translationTasks.length} 个翻译任务（最大并发数：${this.maxConcurrency}）`
      );

      const results = {};
      const promises = [];

      for (const task of translationTasks) {
         const promise = this.addToTranslationQueue(task);
         promises.push(promise);
      }

      const translationResults = await Promise.allSettled(promises);

      translationResults.forEach((result, index) => {
         const task = translationTasks[index];
         if (result.status === "fulfilled") {
            results[task.key] = result.value;
         } else {
            console.error(
               `❌ 翻译最终失败: ${task.text}`,
               result.reason.message
            );
            results[task.key] = `[翻译失败: ${task.text}]`;
         }
      });

      return results;
   }

   async addToTranslationQueue(task) {
      return new Promise((resolve, reject) => {
         const queueItem = {
            ...task,
            resolve,
            reject,
            timestamp: Date.now(),
         };

         this.translationQueue.push(queueItem);
         this.processTranslationQueue();
      });
   }

   async processTranslationQueue() {
      if (
         this.activeTranslations >= this.maxConcurrency ||
         this.translationQueue.length === 0
      ) {
         return;
      }

      const task = this.translationQueue.shift();
      if (!task) return;

      this.activeTranslations++;
      console.log(
         `🔄 开始翻译 [${this.activeTranslations}/${this.maxConcurrency}]: "${task.text}"`
      );

      try {
         const result = await this.translateWithRetry(task.text);
         console.log(`✅ 翻译完成: "${task.text}" → "${result}"`);
         task.resolve(result);
      } catch (error) {
         task.reject(error);
      } finally {
         this.activeTranslations--;
         setTimeout(() => this.processTranslationQueue(), 100);
      }
   }

   async syncFile(filename) {
      const zhFilePath = path.join(this.zhDir, filename);
      const enFilePath = path.join(this.enDir, filename);
      const cacheFilePath = path.join(this.cacheDir, `${filename}.json`);

      if (!fs.existsSync(zhFilePath)) {
         console.error(`❌ 中文文件不存在: ${zhFilePath}`);
         return;
      }

      console.log(`📄 正在处理文件: ${filename}`);

      const zhContent = this.parseI18nFile(zhFilePath);
      const enContent = fs.existsSync(enFilePath)
         ? this.parseI18nFile(enFilePath)
         : {};

      let cachedContent = {};
      if (fs.existsSync(cacheFilePath)) {
         try {
            cachedContent = JSON.parse(fs.readFileSync(cacheFilePath, "utf8"));
         } catch (error) {
            console.warn(`⚠️ 缓存文件损坏，重新建立缓存: ${cacheFilePath}`);
         }
      }

      const changedKeys = [];
      const missingKeys = [];
      const deletedKeys = [];

      for (const [key, value] of Object.entries(zhContent)) {
         if (cachedContent[key] !== value) {
            changedKeys.push({
               key,
               oldValue: cachedContent[key],
               newValue: value,
            });
         }
         if (!enContent[key]) {
            missingKeys.push(key);
         }
      }

      for (const key of Object.keys(cachedContent)) {
         if (!zhContent[key]) {
            deletedKeys.push(key);
         }
      }

      for (const key of deletedKeys) {
         if (enContent[key]) {
            delete enContent[key];
            console.log(`🗑️ 删除英文键: ${key}`);
         }
      }

      if (changedKeys.length > 0) {
         console.log(`🔄 检测到 ${changedKeys.length} 个键值对发生变化:`);
         changedKeys.forEach(({ key, oldValue, newValue }) => {
            console.log(`  - ${key}: "${oldValue}" → "${newValue}"`);
         });
      }

      if (deletedKeys.length > 0) {
         console.log(`🗑️ 检测到 ${deletedKeys.length} 个键被删除:`);
         deletedKeys.forEach((key) => {
            console.log(`  - ${key}`);
         });
      }

      const needsTranslation = [
         ...new Set([...missingKeys, ...changedKeys.map((c) => c.key)]),
      ];

      if (needsTranslation.length === 0 && deletedKeys.length === 0) {
         console.log(`✅ ${filename} 已经是最新的，无需翻译`);
         return;
      }

      if (needsTranslation.length > 0) {
         console.log(
            `📊 发现 ${missingKeys.length} 个缺失键，${changedKeys.length} 个需要更新的键`
         );
         console.log(`开始翻译 ${needsTranslation.length} 个项目...`);

         const translationTasks = needsTranslation.map((key) => ({
            key,
            text: zhContent[key],
         }));

         const translationResults = await this.translateBatch(translationTasks);

         Object.entries(translationResults).forEach(([key, translation]) => {
            enContent[key] = translation;
         });

         console.log(
            `✅ 批量翻译完成，共处理 ${
               Object.keys(translationResults).length
            } 个项目`
         );
      }

      const enFileContent = `// eslint-disable-next-line import/no-anonymous-default-export

export default {
${this.objectToTsString(enContent)}
};
`;

      fs.writeFileSync(enFilePath, enFileContent, "utf8");
      console.log(`✅ 已更新英文文件: ${enFilePath}`);

      fs.writeFileSync(
         cacheFilePath,
         JSON.stringify(zhContent, null, 2),
         "utf8"
      );
      console.log(`💾 已更新缓存文件`);

      console.log(`✅ ${filename} 同步完成\n`);
   }
}

/**
 * 中文字符串处理器
 */
class ChineseStringProcessor {
   constructor() {
      this.srcPath = path.join(__dirname, "..", "src");
      this.i18nPath = path.join(this.srcPath, "i18n");
      this.commonZhPath = path.join(this.i18nPath, "lang/zh/common.ts");
      this.commonEnPath = path.join(this.i18nPath, "lang/en/common.ts");
      this.currentFilePath = null;
   }

   /**
    * 设置当前正在处理的文件路径
    */
   setCurrentFile(filePath) {
      this.currentFilePath = filePath;
   }

   /**
    * 判断是否应该处理该文件
    */
   shouldProcessFile(filePath) {
      const ext = path.extname(filePath);
      return (
         [".tsx", ".ts", ".jsx", ".js"].includes(ext) &&
         !filePath.includes("node_modules") &&
         !filePath.includes(".next") &&
         !filePath.includes("dist") &&
         !filePath.includes("scripts")
      );
   }

   /**
    * 提取所有包含中文的字符串
    */
   extractChineseStrings(content) {
      const chineseStrings = new Set();

      // 移除注释的简化版本
      const cleanContent = this.removeComments(content);

      // 1. 匹配 JSX 标签内容中的中文：<tag>中文</tag>
      const jsxContentRegex = />(\s*)([\u4e00-\u9fa5][^<]*?)(\s*)</g;
      let match;
      while ((match = jsxContentRegex.exec(cleanContent)) !== null) {
         const text = match[2].trim();
         // 只匹配纯中文文本，长度限制在20个字符以内
         if (text && text.length <= 20 && /[\u4e00-\u9fa5]/.test(text)) {
            chineseStrings.add(text);
         }
      }

      // 2. 匹配字符串字面量中的中文 (JSX属性和普通字符串)
      const stringPatterns = [
         /"([^"]*[\u4e00-\u9fa5][^"]*)"/g, // 双引号字符串
         /'([^']*[\u4e00-\u9fa5][^']*)'/g, // 单引号字符串
      ];

      stringPatterns.forEach((pattern) => {
         let match;
         while ((match = pattern.exec(cleanContent)) !== null) {
            const str = match[1];
            if (str && /[\u4e00-\u9fa5]/.test(str)) {
               // 检查是否已经被t()包装
               const beforeMatch = cleanContent.substring(
                  Math.max(0, match.index - 10),
                  match.index
               );
               if (!beforeMatch.includes("t(")) {
                  chineseStrings.add(str);
               }
            }
         }
      });

      return Array.from(chineseStrings);
   }

   /**
    * 移除代码中的注释
    */
   removeComments(content) {
      const lines = content.split("\n");
      const cleanLines = lines.map((line) => {
         const trimmedLine = line.trim();

         if (
            trimmedLine.startsWith("//") ||
            trimmedLine.startsWith("/*") ||
            trimmedLine.startsWith("*") ||
            trimmedLine === ""
         ) {
            return "";
         }

         return line;
      });

      return cleanLines.join("\n");
   }

   /**
    * 替换文件中的中文字符串为 t() 函数调用
    */
   replaceChineseStrings(content, chineseStrings) {
      let newContent = content;

      // 为每个中文字符串进行替换
      chineseStrings.forEach((chineseStr) => {
         // 转义特殊字符用于正则表达式
         const escapedStr = chineseStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

         // 1. 匹配 JSX 标签内容 (需要用 {t("...")} 格式)
         // 例如: <div>中文</div> -> <div>{t("中文")}</div>
         const jsxContentRegex = new RegExp(`(>\\s*)${escapedStr}(\\s*<)`, "g");
         newContent = newContent.replace(
            jsxContentRegex,
            `$1{t("${chineseStr}")}$2`
         );

         // 2. 匹配 JSX 属性中的双引号字符串 (需要用 {t("...")} 格式)
         // 例如: label="中文" -> label={t("中文")}
         // 但要排除已经是 t() 形式的
         const jsxAttrRegex = new RegExp(
            `([a-zA-Z][a-zA-Z0-9]*=)"${escapedStr}"`,
            "g"
         );
         newContent = newContent.replace(
            jsxAttrRegex,
            `$1{t("${chineseStr}")}`
         );

         // 3. 匹配普通的双引号字符串中的中文 (用 t("...") 格式)
         // 使用负向后行断言，避免替换已经被 t() 包装的字符串
         const doubleQuoteRegex = new RegExp(
            `(?<!t\\()"${escapedStr}"(?!\\))`,
            "g"
         );
         newContent = newContent.replace(
            doubleQuoteRegex,
            `t("${chineseStr}")`
         );

         // 4. 匹配单引号字符串 (用 t("...") 格式)
         const singleQuoteRegex = new RegExp(
            `(?<!t\\()'${escapedStr}'(?!\\))`,
            "g"
         );
         newContent = newContent.replace(
            singleQuoteRegex,
            `t("${chineseStr}")`
         );
      });

      return newContent;
   }

   /**
    * 确保导入了 useTranslation
    */
   ensureUseTranslationImport(content) {
      if (
         content.includes("useTranslation") &&
         content.includes("@/i18n/hooks")
      ) {
         return content;
      }

      const lines = content.split("\n");
      let importIndex = -1;

      for (let i = 0; i < lines.length; i++) {
         if (
            lines[i].trim().startsWith("import ") &&
            !lines[i].includes("//")
         ) {
            importIndex = i;
         }
      }

      if (importIndex >= 0) {
         const importStatement =
            'import { useTranslation } from "@/i18n/hooks";';
         lines.splice(importIndex + 1, 0, importStatement);
         return lines.join("\n");
      }

      if (content.includes('"use client"')) {
         return content.replace(
            '"use client";',
            '"use client";\nimport { useTranslation } from "@/i18n/hooks";'
         );
      }

      const importStatement =
         'import { useTranslation } from "@/i18n/hooks";\n';
      return importStatement + content;
   }

   /**
    * 确保组件中声明了 t 变量
    */
   ensureTVariableDeclaration(content) {
      if (content.includes("const { t }") || content.includes("const t =")) {
         return content;
      }

      const functionMatch = content.match(
         /(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{)/
      );
      if (!functionMatch) {
         return content;
      }

      const functionStart = functionMatch.index + functionMatch[0].length;
      const tDeclaration = '\n  const { t } = useTranslation("common");\n';

      return (
         content.slice(0, functionStart) +
         tDeclaration +
         content.slice(functionStart)
      );
   }

   /**
    * 提取现有的键
    */
   extractExistingKeys(content) {
      const keys = new Set();

      try {
         const exportMatch = content.match(
            /export\s+default\s+({[\s\S]*})\s*;?\s*$/
         );
         if (exportMatch) {
            let objectStr = exportMatch[1];
            objectStr = objectStr.replace(/\/\*[\s\S]*?\*\//g, "");
            objectStr = objectStr.replace(/\/\/.*$/gm, "");

            const func = new Function("return " + objectStr);
            const obj = func();

            for (const key of Object.keys(obj)) {
               keys.add(key);
            }

            return keys;
         }
      } catch (error) {
         console.warn(
            `⚠️ 解析对象失败，使用正则表达式备用方案: ${error.message}`
         );
      }

      // 备用方案：使用正则表达式匹配
      const lines = content.split("\n");
      for (const line of lines) {
         const trimmedLine = line.trim();
         if (
            trimmedLine.startsWith("//") ||
            trimmedLine.startsWith("/*") ||
            trimmedLine.startsWith("*") ||
            trimmedLine === "" ||
            trimmedLine === "{" ||
            trimmedLine === "}" ||
            trimmedLine.includes("export") ||
            trimmedLine.includes("eslint")
         ) {
            continue;
         }

         const keyMatches = [
            /"([^"]+)"\s*:\s*"[^"]*"/g,
            /^\s*([a-zA-Z_$\u4e00-\u9fa5][\w\u4e00-\u9fa5]*)\s*:\s*"[^"]*"/g,
         ];

         for (const regex of keyMatches) {
            let match;
            regex.lastIndex = 0;
            while ((match = regex.exec(line)) !== null) {
               const key = match[1];
               if (key && key.trim()) {
                  keys.add(key);
               }
            }
         }
      }

      return keys;
   }

   /**
    * 更新 common.ts 文件
    */
   updateCommonFile(strings) {
      try {
         if (!fs.existsSync(this.commonZhPath)) {
            console.warn(`⚠️  文件不存在: ${this.commonZhPath}`);
            return false;
         }

         // 过滤掉无效的字符串
         const validStrings = strings.filter((str) => {
            return (
               str &&
               str.length <= 50 &&
               !str.includes("\n") &&
               !str.includes("\r") &&
               !str.includes("<") &&
               !str.includes(">") &&
               /[\u4e00-\u9fa5]/.test(str.trim())
            ); // 只要包含中文字符即可
         });

         if (validStrings.length === 0) {
            console.log("📝 没有有效的中文字符串需要添加");
            return false;
         }

         let content = fs.readFileSync(this.commonZhPath, "utf8");
         const existingKeys = this.extractExistingKeys(content);

         const newEntries = [];
         for (const str of validStrings) {
            const keyExists =
               existingKeys.has(str) || existingKeys.has(`"${str}"`);

            if (!keyExists) {
               newEntries.push(`   "${str}": "${str}",`);
            }
         }

         if (newEntries.length > 0) {
            const lastBraceIndex = content.lastIndexOf("}");
            if (lastBraceIndex > 0) {
               const beforeBrace = content.slice(0, lastBraceIndex).trimEnd();
               const afterBrace = content.slice(lastBraceIndex);

               const newContent =
                  beforeBrace +
                  (beforeBrace.endsWith(",") ? "" : ",") +
                  "\n\n   // 自动添加的翻译\n" +
                  newEntries.join("\n") +
                  "\n" +
                  afterBrace;

               fs.writeFileSync(this.commonZhPath, newContent, "utf8");
               console.log(
                  `📝 已更新中文 common.ts，添加了 ${newEntries.length} 个新条目`
               );

               // 同时更新英文文件（异步）
               setTimeout(async () => {
                  try {
                     await this.updateEnglishFile(validStrings);
                  } catch (error) {
                     console.error(`❌ 同步英文文件时出错: ${error.message}`);
                  }
               }, 0);

               return true;
            }
         } else {
            console.log("📝 所有翻译都已存在，无需更新 common.ts");
         }
         return false;
      } catch (error) {
         console.error(`❌ 更新 common.ts 时出错:`, error.message);
         return false;
      }
   }

   /**
    * 更新英文 common.ts 文件
    */
   async updateEnglishFile(strings) {
      try {
         if (!fs.existsSync(this.commonEnPath)) {
            console.warn(`⚠️  英文文件不存在: ${this.commonEnPath}`);
            return false;
         }

         // 过滤掉无效的字符串
         const validStrings = strings.filter((str) => {
            return (
               str &&
               str.length <= 50 &&
               !str.includes("\n") &&
               !str.includes("\r") &&
               !str.includes("<") &&
               !str.includes(">") &&
               /[\u4e00-\u9fa5]/.test(str.trim())
            ); // 只要包含中文字符即可
         });

         if (validStrings.length === 0) {
            console.log("📝 没有有效的中文字符串需要添加到英文文件");
            return false;
         }

         let content = fs.readFileSync(this.commonEnPath, "utf8");
         const existingKeys = this.extractExistingKeys(content);

         const newStrings = [];
         for (const str of validStrings) {
            const keyExists =
               existingKeys.has(str) || existingKeys.has(`"${str}"`);

            if (!keyExists) {
               newStrings.push(str);
            }
         }

         if (newStrings.length > 0) {
            console.log(`🌍 准备翻译 ${newStrings.length} 个新的中文字符串...`);

            // 使用I18nSyncer的批量翻译功能，包含重试机制
            const syncer = new I18nSyncer();
            const translationTasks = newStrings.map((str) => ({
               key: str,
               text: str,
            }));

            console.log(
               `📊 使用批量翻译处理 ${translationTasks.length} 个任务，包含重试机制...`
            );
            const translationResults = await syncer.translateBatch(
               translationTasks
            );

            const newEntries = [];
            for (const str of newStrings) {
               const translation = translationResults[str];
               if (translation && !translation.startsWith("[翻译失败:")) {
                  newEntries.push(`   "${str}": "${translation}",`);
                  console.log(`✅ 翻译完成: "${str}" → "${translation}"`);
               } else {
                  // 如果翻译失败，尝试本地词典翻译
                  const localTranslation =
                     syncer.translator.localTranslate(str);
                  if (
                     localTranslation &&
                     !localTranslation.startsWith("[翻译失败:")
                  ) {
                     newEntries.push(`   "${str}": "${localTranslation}",`);
                     console.log(
                        `🔄 使用本地翻译: "${str}" → "${localTranslation}"`
                     );
                  } else {
                     newEntries.push(`   "${str}": "${str}",`);
                     console.warn(`⚠️ 翻译完全失败，使用原文: "${str}"`);
                  }
               }
            }

            const lastBraceIndex = content.lastIndexOf("}");
            if (lastBraceIndex > 0) {
               const beforeBrace = content.slice(0, lastBraceIndex).trimEnd();
               const afterBrace = content.slice(lastBraceIndex);

               const newContent =
                  beforeBrace +
                  (beforeBrace.endsWith(",") ? "" : ",") +
                  "\n\n   // 自动添加的翻译\n" +
                  newEntries.join("\n") +
                  "\n" +
                  afterBrace;

               fs.writeFileSync(this.commonEnPath, newContent, "utf8");
               console.log(
                  `📝 已更新英文 common.ts，添加了 ${newEntries.length} 个新条目`
               );

               return true;
            }
         } else {
            console.log("📝 所有翻译都已存在于英文文件，无需更新");
         }
         return false;
      } catch (error) {
         console.error(`❌ 更新英文 common.ts 时出错:`, error.message);
         return false;
      }
   }

   /**
    * 处理文件
    */
   async processFile(filePath) {
      if (!this.shouldProcessFile(filePath)) {
         console.log(`⚠️ 跳过不支持的文件类型: ${path.basename(filePath)}`);
         return false;
      }

      if (!fs.existsSync(filePath)) {
         console.error(`❌ 文件不存在: ${filePath}`);
         return false;
      }

      console.log(`🔄 处理文件: ${path.relative(process.cwd(), filePath)}`);

      try {
         let content = fs.readFileSync(filePath, "utf8");
         const originalContent = content;

         // 1. 提取所有包含中文的字符串
         const chineseStrings = this.extractChineseStrings(content);

         if (chineseStrings.length === 0) {
            console.log("ℹ️ 文件中没有找到包含中文的字符串");
            return false;
         }

         console.log(`📋 发现 ${chineseStrings.length} 个中文字符串:`);
         chineseStrings.forEach((str, index) => {
            console.log(`  ${index + 1}. "${str}"`);
         });

         // 2. 替换中文字符串为 t() 函数调用
         content = this.replaceChineseStrings(content, chineseStrings);

         // 3. 确保导入了 useTranslation
         content = this.ensureUseTranslationImport(content);

         // 4. 确保组件中声明了 t 变量
         content = this.ensureTVariableDeclaration(content);

         // 5. 更新 common.ts 文件
         const updated = this.updateCommonFile(chineseStrings);

         // 6. 如果中文文件有更新，同步英文翻译
         if (updated) {
            console.log(`📤 正在同步英文翻译...`);
            try {
               const syncer = new I18nSyncer();
               await syncer.syncFile("common.ts");
               console.log(`✅ 英文翻译同步完成`);
            } catch (error) {
               console.warn(`⚠️ 自动同步英文翻译失败: ${error.message}`);
            }
         }

         // 7. 写回文件
         if (content !== originalContent) {
            fs.writeFileSync(filePath, content, "utf8");
            console.log(`✅ 文件内容已更新`);
         }

         console.log(`🎉 文件处理完成！\n`);
         return true;
      } catch (error) {
         console.error(`❌ 处理文件时出错: ${error.message}`);
         return false;
      }
   }
}

/**
 * 键盘监听器
 */
class KeyboardListener {
   constructor() {
      this.processor = new ChineseStringProcessor();
      this.isListening = false;
      this.currentFile = null;
   }

   /**
    * 启动键盘监听
    */
   async start() {
      this.isListening = true;

      console.log("🎯 i18n 键盘监听器已启动");
      console.log("");
      console.log("功能说明:");
      console.log("  • 实时监听文件修改（最近10秒内）");
      console.log("  • 自动检测当前正在编辑的文件");
      console.log("  • 按 Ctrl+S 处理当前文件的中文字符串");
      console.log("  • 自动替换为 t() 函数并添加翻译");
      console.log("");
      console.log("使用方法:");
      console.log("1. 脚本会自动检测你正在编辑的文件");
      console.log("2. 编辑任何 .tsx/.ts/.jsx/.js 文件");
      console.log("3. 按 Ctrl+S 处理当前文件");
      console.log("4. 输入 'exit' 退出程序");
      console.log("");

      // 启动文件监听
      this.startFileMonitoring();

      // 设置终端为 raw 模式以捕获键盘输入
      if (process.stdin.setRawMode) {
         process.stdin.setRawMode(true);
      }
      process.stdin.resume();
      process.stdin.setEncoding("utf8");

      const rl = readline.createInterface({
         input: process.stdin,
         output: process.stdout,
      });

      console.log(
         "💡 开始监听键盘输入，按 Ctrl+S 处理文件，或输入 'exit' 退出："
      );

      // 监听键盘输入
      process.stdin.on("data", (key) => {
         // Ctrl+S 的键码
         if (key === "\u0013") {
            this.handleCtrlS();
         }
         // Ctrl+C 退出
         else if (key === "\u0003") {
            this.stop();
            process.exit(0);
         }
      });

      rl.on("line", async (input) => {
         const trimmedInput = input.trim();

         if (trimmedInput.toLowerCase() === "exit") {
            this.stop();
            rl.close();
            return;
         }

         if (trimmedInput) {
            const fullPath = path.resolve(trimmedInput);
            if (fs.existsSync(fullPath)) {
               this.currentFile = fullPath;
               console.log(
                  `✅ 当前文件已手动设置为: ${path.relative(
                     process.cwd(),
                     fullPath
                  )}`
               );
               console.log("现在按 Ctrl+S 处理此文件：");
            } else {
               console.log(`❌ 文件不存在: ${fullPath}`);
               console.log("请重新输入文件路径：");
            }
         }
      });
   }

   /**
    * 处理 Ctrl+S 按键事件
    */
   async handleCtrlS() {
      if (!this.currentFile) {
         console.log("\n⚠️  没有检测到当前编辑的文件");
         console.log("请先编辑一个 .tsx/.ts/.jsx/.js 文件，或手动输入文件路径");
         return;
      }

      console.log(`\n🚀 检测到 Ctrl+S，开始处理文件...`);

      try {
         await this.processFileIfNeeded(this.currentFile);
         console.log("\n💡 按 Ctrl+S 继续处理，或输入新的文件路径：");
      } catch (error) {
         console.log(`\n❌ 处理文件时出错: ${error.message}`);
         console.log("💡 按 Ctrl+S 重试，或输入新的文件路径：");
      }
   }

   /**
    * 尝试获取当前正在编辑的文件
    */
   async tryGetCurrentEditingFile() {
      try {
         // 方法1: 检查命令行参数
         const args = process.argv.slice(2);
         if (args.length > 0) {
            const argFile = args[0];
            const fullPath = path.resolve(argFile);
            if (fs.existsSync(fullPath)) {
               this.currentFile = fullPath;
               this.currentFile = fullPath;
               console.log(
                  `🎯 从命令行参数获取到文件: ${path.relative(
                     process.cwd(),
                     fullPath
                  )}`
               );
               return;
            }
         }

         // 方法2: 检查最近修改的 .tsx/.ts 文件 (在 src 目录下)
         const srcDir = path.join(process.cwd(), "src");
         if (fs.existsSync(srcDir)) {
            const recentFile = this.findRecentEditedFile(srcDir);
            if (recentFile) {
               this.currentFile = recentFile;
               console.log(
                  `🔍 自动检测到最近修改的文件: ${path.relative(
                     process.cwd(),
                     recentFile
                  )}`
               );
               return;
            }
         }

         console.log("⚠️  未能自动检测到当前编辑的文件");
      } catch (error) {
         console.log("⚠️  自动检测文件时出现错误，请手动输入");
      }
   }

   /**
    * 在指定目录下查找最近修改的 .tsx/.ts 文件
    */
   findRecentEditedFile(dir) {
      let latestFile = null;
      let latestTime = 0;

      const searchFiles = (currentDir) => {
         try {
            const items = fs.readdirSync(currentDir);

            for (const item of items) {
               const itemPath = path.join(currentDir, item);
               const stat = fs.statSync(itemPath);

               if (stat.isDirectory()) {
                  // 跳过 node_modules 等目录
                  if (
                     !item.startsWith(".") &&
                     item !== "node_modules" &&
                     item !== "dist"
                  ) {
                     searchFiles(itemPath);
                  }
               } else if (stat.isFile()) {
                  const ext = path.extname(item);
                  if ([".tsx", ".ts", ".jsx", ".js"].includes(ext)) {
                     if (stat.mtime.getTime() > latestTime) {
                        latestTime = stat.mtime.getTime();
                        latestFile = itemPath;
                     }
                  }
               }
            }
         } catch (error) {
            // 忽略权限错误
         }
      };

      try {
         searchFiles(dir);

         // 只返回最近10秒内修改的文件
         const tenSecondsAgo = Date.now() - 10 * 1000;
         if (latestTime > tenSecondsAgo) {
            return latestFile;
         }
      } catch (error) {
         // 忽略错误
      }

      return null;
   }

   /**
    * 持续监听文件变化和当前编辑状态
    */
   startFileMonitoring() {
      console.log("🔍 开始监听文件变化...");

      // 每秒检查一次最近修改的文件
      this.fileMonitoringInterval = setInterval(() => {
         const srcDir = path.join(process.cwd(), "src");
         if (fs.existsSync(srcDir)) {
            const recentFile = this.findRecentEditedFile(srcDir);

            if (recentFile && recentFile !== this.currentFile) {
               this.currentFile = recentFile;
               console.log(
                  `\n📝 检测到正在编辑: ${path.relative(
                     process.cwd(),
                     recentFile
                  )}`
               );
               console.log("💡 按 Ctrl+S 处理此文件的中文字符串");
            }
         }
      }, 1000); // 每秒检查一次
   }

   /**
    * 停止文件监听
    */
   stopFileMonitoring() {
      if (this.fileMonitoringInterval) {
         clearInterval(this.fileMonitoringInterval);
         this.fileMonitoringInterval = null;
      }
   }

   /**
    * 停止监听
    */
   stop() {
      console.log("\n🛑 键盘监听器已停止");
      this.isListening = false;

      // 停止文件监听
      this.stopFileMonitoring();

      if (process.stdin.setRawMode) {
         process.stdin.setRawMode(false);
      }
      process.stdin.pause();
   }
}

// 检查命令行参数，如果包含 --sync，则执行同步而不是启动自动处理器
const args = process.argv.slice(2);
if (args.includes("--sync")) {
   console.log("🔄 开始手动同步中文到英文...");
   syncZhToEn();
} else if (args.includes("--retry")) {
   console.log("🔄 开始重试翻译失败的项目...");
   retryFailedTranslations();
} else if (args.includes("--cleanup")) {
   console.log("🧹 开始清理未使用的翻译键...");
   cleanupUnusedKeys();
} else {
   // 启动自动文件处理器
   const processor = new AutoFileProcessor();
   processor.start();
}

// 清理未使用的翻译键
async function cleanupUnusedKeys() {
    const srcPath = path.join(process.cwd(), "src");
    const zhCommonPath = path.join(process.cwd(), "src/i18n/lang/zh/common.ts");
    const enCommonPath = path.join(process.cwd(), "src/i18n/lang/en/common.ts");
    
    try {
        // 获取所有源文件中使用的翻译键
        const usedKeys = new Set();
        await scanUsedKeys(srcPath, usedKeys);
        
        // 读取当前的中文翻译文件
        const zhContent = fs.readFileSync(zhCommonPath, 'utf8');
        const zhKeys = extractKeysFromFile(zhContent);
        
        // 读取当前的英文翻译文件
        const enContent = fs.readFileSync(enCommonPath, 'utf8');
        const enKeys = extractKeysFromFile(enContent);
        
        // 找出未使用的键
        const unusedZhKeys = zhKeys.filter(key => !usedKeys.has(key));
        const unusedEnKeys = enKeys.filter(key => !usedKeys.has(key));
        
        console.log(`📊 扫描结果：`);
        console.log(`  - 使用中的键: ${usedKeys.size}`);
        console.log(`  - 中文未使用键: ${unusedZhKeys.length}`);
        console.log(`  - 英文未使用键: ${unusedEnKeys.length}`);
        
        if (unusedZhKeys.length === 0 && unusedEnKeys.length === 0) {
            console.log("✅ 没有发现未使用的翻译键！");
            return;
        }
        
        // 清理中文文件
        if (unusedZhKeys.length > 0) {
            const newZhContent = removeKeysFromFile(zhContent, unusedZhKeys);
            fs.writeFileSync(zhCommonPath, newZhContent, 'utf8');
            console.log(`🧹 已从中文文件删除 ${unusedZhKeys.length} 个未使用的键`);
        }
        
        // 清理英文文件
        if (unusedEnKeys.length > 0) {
            const newEnContent = removeKeysFromFile(enContent, unusedEnKeys);
            fs.writeFileSync(enCommonPath, newEnContent, 'utf8');
            console.log(`🧹 已从英文文件删除 ${unusedEnKeys.length} 个未使用的键`);
        }
        
        console.log("✅ 清理完成！");
        
    } catch (error) {
        console.error("清理未使用键时出错:", error);
    }
}

// 递归扫描使用的翻译键
async function scanUsedKeys(dirPath, usedKeys) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // 跳过一些不需要扫描的目录
            if (!["node_modules", ".git", ".next", "dist", "build"].includes(item)) {
                await scanUsedKeys(fullPath, usedKeys);
            }
        } else if (stat.isFile()) {
            // 只处理相关的源文件
            if (/\.(tsx?|jsx?)$/.test(item)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                extractUsedKeysFromContent(content, usedKeys);
            }
        }
    }
}

// 从文件内容中提取使用的翻译键
function extractUsedKeysFromContent(content, usedKeys) {
    // 匹配 t("key") 和 t('key') 格式
    const tPattern = /t\(\s*["']([^"']+)["']\s*\)/g;
    let match;
    
    while ((match = tPattern.exec(content)) !== null) {
        usedKeys.add(match[1]);
    }
}

// 从翻译文件中提取所有键
function extractKeysFromFile(content) {
    const keys = [];
    // 匹配对象键的模式
    const keyPattern = /^\s*["']([^"']+)["']\s*:/gm;
    let match;
    
    while ((match = keyPattern.exec(content)) !== null) {
        keys.push(match[1]);
    }
    
    return keys;
}

// 从文件内容中删除指定的键
function removeKeysFromFile(content, keysToRemove) {
    let newContent = content;
    
    for (const key of keysToRemove) {
        // 匹配整行的键值对（包括可能的逗号）
        const keyLinePattern = new RegExp(`^\\s*["']${escapeRegex(key)}["']\\s*:.*?(?:,\\s*)?$`, 'gm');
        newContent = newContent.replace(keyLinePattern, '');
    }
    
    // 清理多余的空行
    newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return newContent;
}

// 转义正则表达式特殊字符
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 手动同步中文文件到英文文件
 */
async function syncZhToEn() {
   try {
      const processorInstance = new ChineseStringProcessor();

      // 读取中文文件内容
      if (!fs.existsSync(processorInstance.commonZhPath)) {
         console.error(`❌ 中文文件不存在: ${processorInstance.commonZhPath}`);
         return;
      }

      if (!fs.existsSync(processorInstance.commonEnPath)) {
         console.error(`❌ 英文文件不存在: ${processorInstance.commonEnPath}`);
         return;
      }

      console.log("📖 读取中文文件内容...");
      const zhContent = fs.readFileSync(processorInstance.commonZhPath, "utf8");
      const zhKeys = processorInstance.extractExistingKeys(zhContent);

      console.log("📖 读取英文文件内容...");
      const enContent = fs.readFileSync(processorInstance.commonEnPath, "utf8");
      const enKeys = processorInstance.extractExistingKeys(enContent);

      // 找出中文文件中有，但英文文件中没有的键
      const missingKeys = [];
      for (const key of zhKeys) {
         if (!enKeys.has(key)) {
            missingKeys.push(key);
         }
      }

      if (missingKeys.length === 0) {
         console.log("✅ 英文文件已经是最新的，无需同步");
         return;
      }

      console.log(`🔍 发现 ${missingKeys.length} 个需要同步的键:`);
      missingKeys.forEach((key, index) => {
         console.log(`  ${index + 1}. "${key}"`);
      });

      // 更新英文文件
      await processorInstance.updateEnglishFile(missingKeys);

      console.log("🎉 同步完成！");
   } catch (error) {
      console.error(`❌ 同步过程中出错: ${error.message}`);
   }
}

/**
 * 重试翻译失败的项目
 */
async function retryFailedTranslations() {
   try {
      const processorInstance = new ChineseStringProcessor();

      if (!fs.existsSync(processorInstance.commonEnPath)) {
         console.error(`❌ 英文文件不存在: ${processorInstance.commonEnPath}`);
         return;
      }

      console.log("📖 读取英文文件内容，查找翻译失败的项目...");
      const enContent = fs.readFileSync(processorInstance.commonEnPath, "utf8");

      // 查找翻译失败的项目
      const failedTranslations = [];
      const lines = enContent.split("\n");

      for (const line of lines) {
         const failedMatch = line.match(
            /^\s*"([^"]+)":\s*"\[翻译失败:\s*([^"]+)\]",?\s*$/
         );
         if (failedMatch) {
            const key = failedMatch[1];
            failedTranslations.push(key);
         }
      }

      if (failedTranslations.length === 0) {
         console.log("✅ 没有发现翻译失败的项目");
         return;
      }

      console.log(`🔍 发现 ${failedTranslations.length} 个翻译失败的项目:`);
      failedTranslations.forEach((key, index) => {
         console.log(`  ${index + 1}. "${key}"`);
      });

      console.log(`🌍 开始重新翻译...`);

      // 使用I18nSyncer的批量翻译功能进行重试
      const syncer = new I18nSyncer();
      const translationTasks = failedTranslations.map((str) => ({
         key: str,
         text: str,
      }));

      console.log(`📊 使用批量翻译重试 ${translationTasks.length} 个任务...`);
      const translationResults = await syncer.translateBatch(translationTasks);

      // 更新英文文件内容
      let newContent = enContent;
      let successCount = 0;

      for (const key of failedTranslations) {
         const translation = translationResults[key];
         if (translation && !translation.startsWith("[翻译失败:")) {
            const failedPattern = new RegExp(
               `(\\s*"${key.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
               )}":\\s*)"\\[翻译失败:\\s*[^"]+\\]"`,
               "g"
            );
            const replacement = `$1"${translation.replace(/"/g, '\\"')}"`;
            newContent = newContent.replace(failedPattern, replacement);
            console.log(`✅ 重试成功: "${key}" → "${translation}"`);
            successCount++;
         } else {
            console.warn(`⚠️ 重试仍然失败: "${key}"`);
         }
      }

      if (successCount > 0) {
         fs.writeFileSync(processorInstance.commonEnPath, newContent, "utf8");
         console.log(
            `📝 已更新英文文件，成功重试了 ${successCount}/${failedTranslations.length} 个项目`
         );
      } else {
         console.log(`⚠️ 所有重试都失败了`);
      }

      console.log("🎉 重试完成！");
   } catch (error) {
      console.error(`❌ 重试过程中出错: ${error.message}`);
   }
}

// 启动自动文件处理器
// const processor = new AutoFileProcessor();
// processor.start();

// 优雅退出处理
process.on("SIGINT", () => {
   processor.stop();
   process.exit(0);
});

process.on("SIGTERM", () => {
   processor.stop();
   process.exit(0);
});
