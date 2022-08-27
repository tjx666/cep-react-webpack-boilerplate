import { resolve as resolvePath } from 'path';

const PROJECT_ROOT = resolvePath(__dirname, '..');
const BUILD_DIR = resolvePath(PROJECT_ROOT, '../build');
const isTest = process.env.NODE_ENV === 'test';
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

export { PROJECT_ROOT, BUILD_DIR, isDev, isTest, isProd };
