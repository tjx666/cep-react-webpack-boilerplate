(function () {
    /**
     * 数组去重
     * @param {Array} array
     * @returns {Array}
     */
    function deduplicate(array) {
        return array.filter(function (item, index) {
            return array.indexOf(item) === index;
        });
    }

    Object.assign(api._, {
        deduplicate: deduplicate,
    });
})();
