import { stringify } from 'javascript-stringify';
import { JsonValue } from 'type-fest';

import { formatDuration } from 'utils/common';

import logger from '../logger';
import CSInterfaceV9, { CSEvent } from './v9';

let callbackId = 0;
// 加 prefix 是因为 CEP 事件通讯并不是只存在于这个插件中，别的插件，宿主，c++ 插件都可以互相发送消息
const eventNamePrefix = 'boilerplate.';

function getScheduleCodeStr(eventName: string, data: any) {
    // prettier-ignore
    return `api.emit(
    '${eventName}',
${stringify(data, null, 4)
        ?.split(/[\r\n]/)
        .map((line) => ' '.repeat(4) + line)
        .join('\n')}
)`;
}

export interface ResponseData {
    code: number;
    data: any;
    message: string;
    details: string;
}

interface EmitOptions {
    timeout: number;
}

/**
 * 可以在这自定义一些接口
 */
class CSInterface extends CSInterfaceV9 {
    // eslint-disable-next-line @typescript-eslint/ban-types
    private listenerStore = new Map<string, Function>();

    async evalScript(script: string): Promise<any> {
        await window.__loadExtendScriptPromise;
        return new Promise((resolve, reject) => {
            try {
                super.evalScript(script, (result) => {
                    resolve(result);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 发送事件到 JSX 端
     */
    emit(
        eventName: string,
        data: JsonValue,
        onResponse?: (data: ResponseData) => void,
        options?: EmitOptions,
    ): void {
        const realEventName = eventNamePrefix + eventName;
        if (onResponse) {
            callbackId++;

            const timeout = options?.timeout ?? 3 * 1000;
            let timer: NodeJS.Timeout | undefined;
            if (__DEV__ && timeout !== -1) {
                const callStartTime = new Date();
                timer = setTimeout(() => {
                    this.removeEventListener(responseEventName, handleResponse);
                    onResponse!({
                        code: -10000,
                        message: `call JSX api: ${eventName} timeout ${timeout}ms!`,
                        data: null,
                        details: `eventName: ${eventName}
    data: ${JSON.stringify(data)}
    callStartTime: ${callStartTime}
    timeout: ${timeout}ms`,
                    });
                }, timeout);
            }

            const responseEventName = `${eventNamePrefix}jsx-response-${callbackId}`;
            const handleResponse = (evt: CSEvent) => {
                if (timer) {
                    clearTimeout(timer);
                }
                // 只会处理一次响应事件
                this.removeEventListener(responseEventName, handleResponse);
                onResponse!(evt.data);
            };
            this.addEventListener(responseEventName, handleResponse);

            const dataObject = {
                __callbackId: callbackId,
                data: data,
            };
            this.evalScript(getScheduleCodeStr(realEventName, dataObject));
        } else {
            this.evalScript(getScheduleCodeStr(realEventName, data));
        }
    }

    invoke<T = void>(eventName: string, data: JsonValue = null, options?: EmitOptions): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const start = Date.now();
            this.emit(
                eventName,
                data,
                (result) => {
                    if (result.code === 0) {
                        const costs = Date.now() - start;
                        if (costs > 100) {
                            logger.warn(
                                `invoke jsx api ${eventName} costs ` + formatDuration(costs),
                            );
                        }
                        resolve(result.data);
                    } else {
                        reject(new Error(result.message));
                    }
                },
                options,
            );
        });
    }

    /**
     * 监听来自 JSX 端的事件
     */
    on(eventName: string, callback: (data: any, response?: (data: any) => void) => void): void {
        const handler = (evt: CSEvent) => {
            const callbackId =
                evt.data instanceof Object && evt.data.__callbackId !== undefined
                    ? evt.data.__callbackId
                    : undefined;

            // 如果有 callbackId，意味着 JSX 那边注册了 onResponse 回调，希望 browser 这边 调用 response
            if (callbackId != undefined) {
                const response = (data: JsonValue) => {
                    this.evalScript(
                        getScheduleCodeStr(
                            `${eventNamePrefix}browser-response-${callbackId}`,
                            data,
                        ),
                    );
                };
                callback(evt.data.data, response);
            } else {
                callback(evt.data);
            }
        };

        const completeEventName = eventNamePrefix + eventName;
        this.addEventListener(completeEventName, handler);
        this.listenerStore.set(completeEventName, handler);
    }

    removeAllListeners() {
        for (const [eventName, listener] of this.listenerStore) {
            this.removeEventListener(eventName, listener);
        }
    }
}

const csInterface = new CSInterface();
window.__csi = csInterface;

window.__loadExtendScriptPromise.then(() => {
    logger.info('load jsx modules success!');

    const duration = (Date.now() - window.__loadExtendScriptStart) / 1000;
    if (duration > 1.5) {
        logger.warn(
            `load jsx modules costs ${duration}s, this may cause startup extension slowly!`,
        );
    }
});

export default csInterface;
export type { CSInterface };
export { CSEvent };
