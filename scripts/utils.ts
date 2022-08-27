import { resolve, join, basename } from 'path';
import pathLib from 'path';
import execa from 'execa';
import fs from 'fs/promises';
import originFs, { constants as FS_CONSTANTS } from 'fs';
import Zip from 'jszip';
import c from 'ansi-colors';
import { PROJECT_ROOT } from './constants';

export function pLimit(promiseCreators: Array<() => Promise<any>>, concurrentCount: number) {
    return new Promise((resolve, reject) => {
        let lastRunIndex = -1;
        let completeCount = 0;

        function addTask() {
            if (lastRunIndex < promiseCreators.length - 1) {
                const currentIndex = lastRunIndex + 1;
                const p = promiseCreators[currentIndex]();
                lastRunIndex = currentIndex;
                p.then(() => {
                    completeCount++;
                    if (completeCount === promiseCreators.length) {
                        resolve(undefined);
                        return;
                    }

                    addTask();
                }).catch(reject);
            }
        }

        const firstRunCount = Math.min(concurrentCount, promiseCreators.length);
        for (let i = 0; i < firstRunCount; i++) {
            addTask();
        }
    });
}

export function getCostString(start: number) {
    return c.green(`${(Date.now() - start) / 1000}s`);
}

/**
 * 将目录中的文件放入 zip 包中
 * @param zip - zip 实例
 * @param dir - 输入目录地址
 * @param folder - zip 包中的文件地址
 */
async function zipFile(zip: Zip, dir: string, folder: string) {
    const files = await fs.readdir(dir);
    await Promise.all(
        files.map(async (file) => {
            const filePath = resolve(dir, file);
            if ((await fs.stat(filePath)).isDirectory()) {
                return zipFile(zip, filePath, join(folder, file));
            }

            const data = await fs.readFile(filePath);
            zip.file(join(folder, file), data);
        }),
    );
}

export async function zipDirectory(source: string, dest: string): Promise<string> {
    const zip = new Zip();
    await zipFile(zip, source, basename(dest, '.zip'));

    const writeStream = originFs.createWriteStream(dest);
    return new Promise<string>((resolve, reject) => {
        zip.generateNodeStream({ streamFiles: true })
            .pipe(writeStream)
            .on('error', (err) => {
                reject(err);
            })
            .on('finish', () => {
                resolve(dest);
            });
    });
}

export async function runCommand(command: string) {
    const subprocess = execa.command(command, { cwd: PROJECT_ROOT });
    const { stdout } = await subprocess;
    return stdout;
}

export function pathExists(path: string) {
    return fs
        .access(path, FS_CONSTANTS.F_OK)
        .then(() => true)
        .catch(() => false);
}

export async function unzip(archivePath: string, dest?: string) {
    const filePath = resolve(archivePath);
    const extname = pathLib.extname(archivePath);
    const basename = pathLib.basename(archivePath, extname);
    const dirname = pathLib.dirname(archivePath);
    dest ??= resolve(dirname, basename);

    return fs
        .readFile(filePath)
        .then((buf) => Zip.loadAsync(buf))
        .then((zip) => {
            const zipFileKeys = Object.keys(zip.files);
            return Promise.all(
                zipFileKeys.map(async (filename) => {
                    const isFile = !zip.files[filename].dir;
                    const fullPath = pathLib.join(dest!, filename);
                    const directory = isFile ? pathLib.dirname(fullPath) : fullPath;
                    if (!(await pathExists(directory))) {
                        await fs.mkdir(directory, { recursive: true });
                    }

                    if (isFile) {
                        const content = await zip.files[filename].async('nodebuffer');
                        if (content) {
                            return fs.writeFile(fullPath, content);
                        } else {
                            return true;
                        }
                    }
                }),
            );
        });
}

export function getSizeStr(kib: number) {
    const MiB = 1024;
    let result = '';
    if (kib > MiB) {
        result += Math.floor(kib / MiB) + 'MiB';
        kib = kib % MiB;
    }

    result += kib.toFixed(3) + 'KiB';
    return c.green(result);
}
