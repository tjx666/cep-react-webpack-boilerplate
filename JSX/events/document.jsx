(function () {
    const emitter = api.emitter;
    const docHelper = api.document;

    emitter.on('document.getActiveDocumentName', function (data, response) {
        response(emitter.createResponse(0, app.documents.length > 0 ? activeDocument.name : null));
    });

    emitter.on('document.getActiveDocumentId', function (data, response) {
        var id = app.documents.length ? activeDocument.id : null;
        response(emitter.createResponse(0, id));
    });

    emitter.on('document.getActiveDocumentFsPath', function (data, response) {
        response(emitter.createResponse(0, activeDocument.fullName.fsName));
    });

    emitter.on('saveDocument', function (data, response) {
        docHelper.saveDocument(typeof data === 'number' ? data : activeDocument.id);
        response();
    });

    emitter.on('document.duplicate', function (data, response) {
        docHelper.duplicateDocument(
            typeof data.documentId === 'number' ? data.documentId : activeDocument.id,
            data.documentCopyName,
        );
        response(emitter.createResponse(0, activeDocument.id));
    });

    emitter.on('document.close', function (data, response) {
        docHelper.closeDocument(typeof data === 'number' ? data : activeDocument.id);
        response();
    });

    emitter.on('document.exportPng', function (data, response) {
        /** @type {Document} */
        var document =
            data.documentId === undefined
                ? activeDocument
                : docHelper.getDocumentById(data.documentId);

        var dest;
        if (data.dest === undefined) {
            dest = new File(Folder.desktop.fsName);
            dest.changePath(api.path.sanitize(document.name) + '.png');
        } else {
            dest = new File(data.dest);
        }
        api.saveFile.saveDocumentToPng(document, dest);
        response();
    });

    emitter.on('document.getActiveDocumentCanvasSize', function (data, response) {
        if (app.documents.length === 0) {
            response(emitter.createResponse(0, null));
        } else {
            response(
                emitter.createResponse(0, {
                    width: activeDocument.width.as('px'),
                    height: activeDocument.height.as('px'),
                }),
            );
        }
    });

    emitter.on('document.importImage', function (data, response) {
        docHelper.importImage(data.path, data.transform);
        response();
    });

    emitter.on('document.exportPng', function (data, response) {
        /** @type {Document} */
        var document =
            data.documentId === undefined
                ? activeDocument
                : docHelper.getDocumentById(data.documentId);

        var dest;
        if (data.dest === undefined) {
            dest = new File(Folder.desktop.fsName);
            dest.changePath(api.path.sanitize(document.name) + '.png');
        } else {
            dest = new File(data.dest);
        }
        api.saveFile.saveDocumentToPng(document, dest);
        response();
    });

    emitter.on('document.getActiveDocumentCanvasSize', function (data, response) {
        if (app.documents.length === 0) {
            response(emitter.createResponse(0, null));
        } else {
            response(
                emitter.createResponse(0, {
                    width: activeDocument.width.as('px'),
                    height: activeDocument.height.as('px'),
                }),
            );
        }
    });

    emitter.on('document.importImage', function (data, response) {
        docHelper.importImage(data.path, data.transform);
        response();
    });
})();
