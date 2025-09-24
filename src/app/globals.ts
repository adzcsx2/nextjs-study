// React 19 兼容性补丁 - 立即执行
// 使用立即执行函数确保补丁在模块加载时立即应用

// 扩展全局类型
declare global {
  var __antd_patch_applied: boolean | undefined;
}

(() => {
  // 确保补丁只执行一次
  if (typeof globalThis !== 'undefined' && !globalThis.__antd_patch_applied) {
    try {
      // 动态导入补丁
      import('@ant-design/v5-patch-for-react-19').then(() => {
        globalThis.__antd_patch_applied = true;
        console.log('Ant Design React 19 compatibility patch applied successfully');
      }).catch((error) => {
        console.warn('Failed to apply Ant Design React 19 compatibility patch:', error);
      });
    } catch (error) {
      console.warn('Failed to apply Ant Design React 19 compatibility patch:', error);
    }
  }
})();

// 静态导入作为备用
import '@ant-design/v5-patch-for-react-19';