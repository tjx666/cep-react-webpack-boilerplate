import childProcess from 'child_process';

import csInterface from './CSInterface';

export function selectFolderInFileExplore(): Promise<string> {
    return csInterface.invoke('window.selectFolderInFileExplore', null, { timeout: -1 });
}

export function revealFolderInFileBrowser(folderPath: string) {
    return csInterface.invoke(
        'window.revealFolderInFileBrowser',
        {
            folderPath,
        },
        { timeout: -1 },
    );
}

export function alert(message: string) {
    return csInterface.invoke('alert', message);
}

function spawn(
    command: string,
    args?: readonly string[] | undefined,
    options?: childProcess.SpawnOptionsWithoutStdio | undefined,
) {
    const subprocess = childProcess.spawn(command, args, options);

    return new Promise<void>((resolve, reject) => {
        subprocess.once('error', reject);
        subprocess.once('close', (exitCode: number) => {
            if (exitCode > 0) {
                reject(`Exited with code ${exitCode}`);
                return;
            }

            resolve();
        });
    });
}

/**
 * 打开自定义schema
 * @param target schema url，如：vscode://xxx.xxx
 * @param appName 指定打开target的app名称，win下为app绝对路径
 * @param appArgs 打开app时传入的参数
 */
async function openCustomSchema(target: string, appName?: string, appArgs?: string[]) {
    if (typeof target !== 'string') {
        throw Error('Expected a `target`');
    }

    let command = 'open';
    const { platform } = process;
    const cliArguments: string[] = [];
    const appArguments: string[] = [];
    const childProcessOptions: Record<string, string | boolean> = {};

    if (Array.isArray(appArgs)) {
        appArguments.push(...appArgs);
    }

    if (platform === 'darwin') {
        if (typeof appName === 'string') {
            cliArguments.push('-a', appName);
        }

        cliArguments.push(target);

        if (appArguments.length) {
            cliArguments.push('--args', ...appArguments);
        }
    } else if (platform === 'win32') {
        const encodedArgs = ['Start'];
        command = `${process.env.SYSTEMROOT}\\System32\\WindowsPowerShell\\v1.0\\powershell`;
        cliArguments.push(
            '-NoProfile',
            '-NonInteractive',
            '-ExecutionPolicy',
            'Bypass',
            '-EncodedCommand',
        );

        // 不给参数加上引号或转义
        childProcessOptions.windowsVerbatimArguments = true;

        // windows下符号 ` 表示转义
        if (typeof appName === 'string') {
            encodedArgs.push('"`"' + appName + '`""', '-ArgumentList');
            appArguments.unshift(target);
        } else {
            encodedArgs.push(`"${target}"`);
        }

        if (appArguments.length) {
            encodedArgs.push(appArguments.map((arg) => '"`"' + arg + '`""').join(','));
        }

        target = Buffer.from(encodedArgs.join(' '), 'utf16le').toString('base64');
        cliArguments.push(target);
    }

    await spawn(command, cliArguments, childProcessOptions);
}

export { openCustomSchema, spawn };
