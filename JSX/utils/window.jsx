api.window = (function () {
    /**
     * 执行某个函数，并且在执行期间不弹窗
     * @param {Function} fn
     * @returns {ReturnType<typeof fn>}
     */
    function operateWithoutWarning(fn) {
        var displayDialogs = app.displayDialogs;
        app.displayDialogs = DialogModes.NO;

        var result;
        result = fn();
        try {
        } finally {
            app.displayDialogs = displayDialogs;
        }
        return result;
    }

    return {
        operateWithoutWarning: operateWithoutWarning,
    };
})();
