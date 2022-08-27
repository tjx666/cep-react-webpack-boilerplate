api.saveFile = (function () {
    /**
     * 将 psd 导出为 jpg 文件
     * @param {Document} document
     * @param {File|string} destFile
     * @param {number} jpegQuality
     */
    function saveDocumentToJPEG(document, destFile, jpegQuality) {
        document = document || activeDocument;
        if (destFile === undefined) {
            destFile = new File(Folder.desktop.fsName + '/' + document.name + '.jpg');
        } else if (typeof destFile === 'string') {
            destFile = new File(destFile);
        }
        jpegQuality = jpegQuality || 7;

        var jpegSaveOptions = new JPEGSaveOptions();
        jpegSaveOptions.quality = jpegQuality;
        document.saveAs(destFile, jpegSaveOptions, true, Extension.LOWERCASE);
    }

    /**
     * 将 psd 导出为 jpg 文件
     * @param {Document} document
     * @param {File|string} destFile
     * @param {number} pngQuality
     */
    function saveDocumentToPng(document, destFile, pngQuality) {
        document = document || activeDocument;
        if (destFile === undefined) {
            destFile = new File(Folder.desktop.fsName + '/' + document.name + '.jpg');
        } else if (typeof destFile === 'string') {
            destFile = new File(destFile);
        }
        pngQuality = pngQuality || 7;

        var png = new PNGSaveOptions();
        png.quality = pngQuality;
        document.saveAs(destFile, png, true, Extension.LOWERCASE);
    }

    return {
        saveDocumentToJPEG: saveDocumentToJPEG,
        saveDocumentToPng: saveDocumentToPng,
    };
})();
