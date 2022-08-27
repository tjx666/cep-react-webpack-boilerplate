api.constants = (function () {
    const isWin = $.os === 'Windows';
    return {
        EXTENSION_FOLDER: new Folder($.fileName).parent.parent.parent,
        isWin: isWin,
        isMac: !isWin,
    };
})();
