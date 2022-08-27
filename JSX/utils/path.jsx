api.path = (function () {
    /**
     * 获取文件的文件夹路径
     * @param {File} fileName
     * @returns {string}
     */
    function getDirPath(fileName) {
        return new File(fileName).parent.fullName;
    }

    /**
     * 获取路径或者文件的路径的扩展名
     * @param {File | string} path
     * @returns
     */
    function getExtension(path) {
        if (path instanceof File) {
            path = path.fsName;
        }

        return path.slice(path.lastIndexOf('.')).toLowerCase();
    }

    /**
     * 清除路径中扩展名
     * @example abc.png -> abc
     * @param {string} path
     * @returns {string}
     */
    function trimExt(path) {
        return path.replace(/\.[\w\d]+$/, '');
    }

    /**
     * Replaces characters in strings that are illegal/unsafe for filenames.
     * Unsafe characters are either removed or replaced by a substitute set
     * in the optional `options` object.
     *
     * Illegal Characters on Various Operating Systems
     * / ? < > \ : * | "
     * https://kb.acronis.com/content/39790
     *
     * Unicode Control codes
     * C0 0x00-0x1f & C1 (0x80-0x9f)
     * http://en.wikipedia.org/wiki/C0_and_C1_control_codes
     *
     * Reserved filenames on Unix-based systems (".", "..")
     * Reserved filenames in Windows ("CON", "PRN", "AUX", "NUL", "COM1",
     * "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
     * "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", and
     * "LPT9") case-insesitively and with or without filename extensions.
     *
     * Capped at 255 characters in length.
     * http://unix.stackexchange.com/questions/32795/what-is-the-maximum-allowed-filename-and-folder-size-with-ecryptfs
     *
     * @param  {String} input   Original filename
     * @param  {string} replacement
     * @return {String}         Sanitized filename
     */
    function sanitize(input, replacement) {
        replacement = replacement || '_';

        // eslint-disable-next-line no-useless-escape
        var illegalRe = /[\/\?<>\\:\*\|"]/g;
        // eslint-disable-next-line no-control-regex
        var controlRe = /[\x00-\x1f\x80-\x9f]/g;
        var reservedRe = /^\.+$/;
        var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
        // eslint-disable-next-line no-useless-escape
        var windowsTrailingRe = /[\. ]+$/;

        if (typeof input !== 'string') {
            throw new Error('Input must be string');
        }
        var sanitized = input
            .replace(illegalRe, replacement)
            .replace(controlRe, replacement)
            .replace(reservedRe, replacement)
            .replace(windowsReservedRe, replacement)
            .replace(windowsTrailingRe, replacement);

        return sanitized;
    }

    /**
     * 获取有效的 basename
     * 做了两件事：
     * 1. 如果 basename 有后缀名，去掉后缀名
     * 2. 替换其中非法字符，顺斜杠，反斜杠，空格等
     * @param {string} basename
     * @returns
     */
    function getValidBasename(basename) {
        return sanitize(trimExt(basename)).replace(/[\s']/g, '_').replace(/_+/g, '_');
    }

    return {
        getDirPath: getDirPath,
        getExtension: getExtension,
        trimExt: trimExt,
        sanitize: sanitize,
        getValidBasename: getValidBasename,
    };
})();
