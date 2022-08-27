import csInterface, { CSEvent } from './CSInterface';
import logger from './logger';
import { copyFile, remove } from './promisifyFs';
import psDOMEvent from './psDomEvent';

// 生产环境持久化面板，也就是收起和展开面板时并不会关闭插件进程
if (__PROD__) {
    const event = new CSEvent(
        'com.adobe.PhotoshopPersistent',
        'APPLICATION',
        csInterface.getApplicationID(),
        csInterface.getExtensionID(),
    );
    csInterface.dispatchEvent(event);
}

/**
 * 刷新页面会触发 beforeunload 事件
 * !: 刷新前注意回收资源，例如各种监听器，订阅，全局对象（主要是 node 中的）
 */
window.addEventListener('beforeunload', () => {
    process.removeAllListeners();
    logger.onDestroy();
    psDOMEvent.destroy();
    csInterface.removeAllListeners();
});

csInterface.addEventListener('boilerplate.console.log', (evt) => {
    console.log('[JSX]', evt.data);
});

csInterface.addEventListener('boilerplate.console.error', (evt) => {
    console.error('[JSX]', evt.data);
});

csInterface.addEventListener('boilerplate.alert', (evt) => {
    alert(evt.data);
});

csInterface.on('fs.copyFile', async (data, response) => {
    try {
        await copyFile(data.src, data.dest);
    } catch (error: any) {
        response!(error?.message || `copy file from ${data.src} to ${data.dest} filed!`);
        return;
    }
    response!(undefined);
});

csInterface.on('fs.removeFolder', async (folderPath: string, response) => {
    try {
        await remove(folderPath);
    } catch (error: any) {
        response!(error?.message || `remove dir ${folderPath} filed!`);
        return;
    }
    response!(undefined);
});
