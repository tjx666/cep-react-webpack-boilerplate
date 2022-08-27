import { exec } from 'child_process';

export const noop = () => {};

export function formatDuration(duration: number) {
    const minute = 1000 * 60;
    const second = 1000;

    if (duration >= minute) {
        return (
            Math.floor(duration / minute) +
            'm ' +
            Math.floor((duration % minute) / second) +
            's ' +
            (duration % second) +
            'ms'
        );
    } else if (duration >= second) {
        return Math.floor(duration / second) + 's ' + (duration % second) + 'ms';
    } else {
        return duration + 'ms';
    }
}

export function execShellScript(script: string) {
    return exec(script, (error) => {
        if (error) {
            console.warn(`> ${script}`);
            console.error(error);
            return;
        }
    });
}

export function arrayToMap<T, K extends keyof T>(array: T[], key: K): Map<T[K], T> {
    const map = new Map<T[K], T>();
    for (const item of array) {
        map.set(item[key], item);
    }
    return map;
}
