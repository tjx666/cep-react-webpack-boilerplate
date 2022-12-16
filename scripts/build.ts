import fsSync from 'fs';
import fs from 'fs/promises';
import { glob } from 'glob';
import { dest, src } from 'gulp';
import jsxbin from 'jsxbin';
import { resolve as resolvePath } from 'path';
import webpack from 'webpack';
import ora, { Ora } from 'ora';
import consola from 'consola';
import c from 'ansi-colors';

import packageJSON from '../package.json';
import args from './args';
import { BUILD_DIR, isDev, isProd, isTest, PROJECT_ROOT } from './constants';
import prodConfig from './webpack.config.prod';
import { getCostString, getSizeStr, pLimit } from './utils';

function bundleWeb(spinner: Ora) {
    const start = Date.now();

    const message = 'Webpack bundle web code';
    spinner.start(message);

    const compiler = webpack(prodConfig);
    function close() {
        compiler.close((closeErr) => {
            if (closeErr) console.error(closeErr);
        });
    }
    return new Promise((resolve, reject) => {
        compiler.run((error, stats) => {
            if (error) {
                console.error(error);
                reject(error);
                close();
                return;
            }
            const { assets } = stats!.toJson({ all: false, assets: true });
            const sizeInfo = assets!
                .filter((a) => a.name.startsWith('js/'))
                .map((a) => `${a.name.replace('js/', '')}: ${getSizeStr(a.size / 1024)}`)
                .join(', ');
            spinner.succeed(`${message} ${getCostString(start)} ${sizeInfo}`);
            close();
            resolve(stats);
        });
    });
}

async function copyFiles(spinner: Ora) {
    const start = Date.now();

    const message = 'copy files to build folder';
    spinner.start(message);

    const patterns = [
        PROJECT_ROOT + '/CSXS/**/*',
        PROJECT_ROOT + '/JSX/**/*',
        ...(isTest ? [PROJECT_ROOT + '/.debug'] : []),
        '!**/._*',
    ];
    if (isTest) {
        patterns.push(...[PROJECT_ROOT + '/.vscode/**', PROJECT_ROOT + '/playground/**/*']);
    }

    return new Promise((resolve, reject) => {
        src(
            patterns.map((p) => p.replace('!**/', `!${PROJECT_ROOT}/**/`)),
            { base: PROJECT_ROOT },
        )
            .pipe(dest(BUILD_DIR))
            .on('end', (result) => {
                spinner.succeed(`${message} ${getCostString(start)}`);
                resolve(result);
            })
            .on('error', reject);
    });
}

async function cleanEmptyFiles(spinner: Ora) {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        const message = 'clean empty folders';
        spinner.start();

        glob(BUILD_DIR + '/**/*', async (err, paths) => {
            if (err) {
                reject(err);
                return;
            }

            const tasks = paths.map((path) => async () => {
                const stats = await fs.lstat(path);
                if (stats.isDirectory()) {
                    const fileNames = await fs.readdir(path);
                    if (fileNames.length === 0) {
                        await fs.rm(path, { recursive: true });
                    }
                }
            });

            pLimit(tasks, 20).then((result) => {
                spinner.succeed(`${message} ${getCostString(start)}`);
                resolve(result);
            });
        });
    });
}

async function updateFiles(spinner: Ora) {
    const start = Date.now();

    const message = 'update extension name，version，port, dev mode etc';
    spinner.start(message);

    const manifestPath = resolvePath(BUILD_DIR, './CSXS/manifest.xml');

    let manifest = await fs.readFile(manifestPath, { encoding: 'utf-8' });
    manifest = manifest
        .replaceAll('./web/public/redirect.html', './web/index.html')
        .replaceAll('dev.boilerplate', 'boilerplate')
        .replaceAll('boilerplateDev', 'boilerplate')
        .replaceAll('Boilerplate Dev', 'Boilerplate')
        .replace(/(ExtensionBundleVersion=)"0.0.1"/, `$1"${packageJSON.version}"`)
        .replace(/(Version=)"0.0.1"/, `$1"${packageJSON.version}"`);

    const jsxIndex = resolvePath(BUILD_DIR, 'JSX/index.jsx');
    let jsxIndexContent = await fs.readFile(jsxIndex, { encoding: 'utf-8' });
    jsxIndexContent = jsxIndexContent
        .replace('$.global.__DEV__ = true', `$.global.__DEV__ = ${isDev}`)
        .replace('$.global.__TEST__ = false', `$.global.__TEST__ = ${isTest}`)
        .replace('$.global.__PROD__ = false', `$.global.__PROD__ = ${isProd}`);
    await fs.writeFile(jsxIndex, jsxIndexContent);

    if (isTest) {
        const dotDebugPath = resolvePath(BUILD_DIR, '.debug');
        let dotDebug = await fs.readFile(dotDebugPath, { encoding: 'utf-8' });
        dotDebug = dotDebug
            .replaceAll('org.ytj.dev.boilerplate.panel', 'org.ytj.boilerplate.panel')
            .replaceAll('9999', '9998');
        await fs.writeFile(dotDebugPath, dotDebug);
    }

    spinner.succeed(`${message} ${getCostString(start)}`);
}

async function jsxToJsxbin(spinner: Ora) {
    const message = '将 jsx 转成 jsxbin';
    spinner.start(message);
    const start = Date.now();
    const jsxOutputDir = resolvePath(BUILD_DIR, 'JSX');
    const jsxIndex = resolvePath(jsxOutputDir, 'index.jsx');
    const jsxbinOutputPath = resolvePath(BUILD_DIR, 'index.jsxbin');
    await jsxbin(jsxIndex, jsxbinOutputPath);
    const sizeInfo = getSizeStr((await fs.stat(jsxbinOutputPath)).size / 1024);
    const fileNames = await fs.readdir(jsxOutputDir);
    const preserveFileNames = new Set(['assets']);
    const rmFiles = fileNames.filter((fileName) => !preserveFileNames.has(fileName));
    await Promise.all(
        rmFiles.map((fileName) => fs.rm(resolvePath(jsxOutputDir, fileName), { recursive: true })),
    );
    await fs.cp(jsxbinOutputPath, resolvePath(jsxOutputDir, 'index.jsxbin'));
    await fs.rm(jsxbinOutputPath);
    spinner.succeed(`${message} ${getCostString(start)} ${sizeInfo}`);
}

async function main() {
    consola.info('Env: ' + c.greenBright.bold(process.env.NODE_ENV!));
    consola.info(`Dest: ${c.green.underline(BUILD_DIR.replace(/(\s+)/g, '\\$1'))}`);
    const spinner = ora();
    const start = Date.now();

    if (fsSync.existsSync(BUILD_DIR)) {
        await fs.rm(BUILD_DIR, { recursive: true });
    }

    await bundleWeb(spinner);

    if (args.all) {
        await copyFiles(spinner);
        await cleanEmptyFiles(spinner);
        await updateFiles(spinner);

        if (isProd) {
            await jsxToJsxbin(spinner);
        }

        console.log(`build v${packageJSON.version} success！costs：${getCostString(start)}`);
    }
}

main();
