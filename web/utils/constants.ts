import os, { homedir } from 'os';
import path from 'path';

import CSInterfaceTypes from 'utils/CSInterface/v9';

import csInterface from './CSInterface';

const isMac = process.platform === 'darwin';
const userDataDir = path.resolve(
    csInterface.getSystemPath(CSInterfaceTypes.SystemPath.USER_DATA),
    'org.ytj.cep.boilerplate',
);
const desktopDir = `${homedir()}/Desktop`;

enum RoutePath {
    Home = '/',
}

const logFileName = 'browser_node_jsx_mixed.log';
let logFilePath: string;
if (__DEV__) {
    logFilePath = path.resolve(__dirname, `logs/${logFileName}`);
} else if (isMac) {
    logFilePath = `${os.homedir()}/Library/Logs/org.ytj.cep.boilerplate/${logFileName}`;
} else {
    logFilePath = `${os.homedir()}/AppData/Roaming/org.ytj.cep.boilerplate/logs/${logFileName}`;
}

export { desktopDir, isMac, logFilePath, RoutePath, userDataDir };
