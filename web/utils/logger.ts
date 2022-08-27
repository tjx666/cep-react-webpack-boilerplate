import dateFormat from 'dateformat';
import fs from 'fs';
import path from 'path';

import { stat, unlink } from 'utils/promisifyFs';

import { logFilePath } from './constants';
import csInterface from './CSInterface';

interface LogOptions {}
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function mkdirSync(dirname: string) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
    return false;
}

const logDir = path.dirname(logFilePath);
mkdirSync(logDir);

async function removeWhenTooLarge(path: string) {
    if (!fs.existsSync(path)) return;
    const stats = await stat(path);
    const fileSizeInMegabytes = stats.size / (1024 * 1024);
    const MAX_LOG_SIZE_MB = 10;
    if (fileSizeInMegabytes > MAX_LOG_SIZE_MB) {
        await unlink(path);
    }
}

class Logger {
    static logger = new Logger();

    private writeToFileFirstTime = true;
    private logWriteStream: fs.WriteStream | undefined;

    private constructor() {
        csInterface.on('logger.log', (data) => {
            this.logToFile(data.content, data.level, true);
        });
    }

    private async logToFile(content: string, level: LogLevel, fromJSX: boolean) {
        if (this.writeToFileFirstTime) {
            await removeWhenTooLarge(logFilePath);
            this.logWriteStream = fs.createWriteStream(logFilePath, {
                encoding: 'utf-8',
                flags: 'a',
            });
            this.writeToFileFirstTime = false;
        }
        const dateTime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss.l');
        const strToFile = `[${dateTime}] [${level.toUpperCase()}] [${
            fromJSX ? 'JSX' : 'Browser'
        }] ${content}\n`;
        if (fromJSX && !__PROD__) {
            console[level](`[JSX] ${content}`);
        }
        this.logWriteStream!.write(strToFile);
    }

    private log(args: any[], level: LogLevel) {
        const options: LogOptions = {};
        let str: string;
        let lastArg: any;

        if (args.length === 0) {
            str = '';
        } else if (args.length === 1) {
            str = '' + args[0];
        } else {
            lastArg = args[args.length - 1];
            // last Object argument is option
            if (lastArg !== null && typeof lastArg === 'object') {
                Object.assign(options, lastArg);
                str = args.slice(0, args.length - 1).join(' ');
            } else {
                str = args.join(' ');
            }
        }

        if (!__PROD__) {
            console[level](str);
            this.logToFile(str, level, false);
        } else {
            if (level !== 'debug') {
                this.logToFile(str, level, false);
            }
        }

        return str;
    }

    debug(...args: any[]) {
        this.log(args, 'debug');
    }

    info(...args: any[]) {
        this.log(args, 'info');
    }

    warn(...args: any[]) {
        this.log(args, 'warn');
    }

    error(...args: any[]) {
        this.log(args, 'error');
    }

    onDestroy() {
        this.logWriteStream?.close();
    }
}

export default Logger.logger;
