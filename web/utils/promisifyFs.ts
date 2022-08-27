import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

export const readdir = promisify(fs.readdir);
export const writeFile = promisify(fs.writeFile);
export const readFile = promisify(fs.readFile);
export const stat = promisify(fs.stat);
export const rmdir = promisify(fs.rmdir);
export const mkdir = promisify(fs.mkdir);
export const unlink = promisify(fs.unlink);
export const copyFile = promisify(fs.copyFile);

export async function remove(folderPath: string) {
    let files = [];

    if (fs.existsSync(folderPath)) {
        files = await readdir(folderPath);
        const len = files.length;
        for (let i = 0; i < len; i++) {
            const file = files[i];
            const currentPath = path.join(folderPath, file);
            const fileInfo = await stat(currentPath);
            if (fileInfo.isDirectory()) {
                await remove(currentPath);
            } else {
                await unlink(currentPath);
            }
        }

        await rmdir(folderPath);
    }
}
