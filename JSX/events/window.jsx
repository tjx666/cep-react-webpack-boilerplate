(function () {
    const emitter = api.emitter;

    emitter.on('window.selectFolderInFileExplore', function (data, response) {
        var folder = Folder.selectDialog('请选择文件夹');
        var folderPath = folder !== null ? folder.fsName : null;
        response(emitter.createResponse(0, folderPath));
    });

    emitter.on('window.revealFolderInFileBrowser', function (data, response) {
        var folder = new Folder(data.folderPath);
        folder.execute();
        response();
    });
})();
