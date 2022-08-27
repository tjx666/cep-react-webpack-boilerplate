api.fs = (function () {
    /**
     * 同步读取文本文件内容
     * @param {File | string} file
     * @param {string} encoding 默认是 UTF-8
     * @returns {string}
     */
    function readTextSync(file, encoding) {
        if (encoding === undefined) encoding = 'UTF-8';

        if (typeof file === 'string') {
            var path = file;
            file = new File(path);
        }
        if (!file.exists) return;

        file.open('r');
        file.encoding = encoding;
        var text = file.read();
        file.close();
        return text;
    }

    /**
     * 同步读取 JSON 文件并解析成对象
     * @param {File | string} file
     * @param {string} encoding 默认是 UTF-8
     * @returns {object}
     */
    function readJSONSync(file, encoding) {
        var json = readTextSync(file, encoding);
        return JSON.parse(json);
    }

    /**
     * 向指定路径写入文本
     * @param {string} file
     * @param {string} text
     * @param {object} options
     * @returns {void}
     */
    function writeTextSync(file, text, options) {
        if (options === undefined) options = {};
        var encoding = options.encoding || 'UTF-8';
        var append = !!options.append;

        if (typeof file === 'string') {
            var path = file;
            file = new File(path);
        }
        file.open(append ? 'a' : 'w');
        file.encoding = encoding;
        file.write(text);
        file.close();
    }

    /**
     * 向指定路径写入对象序列化后的 JSON
     * @param {File | string} file
     * @param {object} object
     * @param {object} options
     * @returns {void}
     */
    function writeJSONSync(file, object, options) {
        options = Object.assign(
            {
                pretty: false,
                indent: 2,
            },
            options,
        );

        writeTextSync(
            file,
            JSON.stringify(object, null, options.pretty ? options.indent : undefined),
            options,
        );
    }

    return {
        readTextSync: readTextSync,
        readJSONSync: readJSONSync,
        writeTextSync: writeTextSync,
        writeJSONSync: writeJSONSync,
    };
})();
