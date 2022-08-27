(function () {
    const emitter = api.emitter;
    const historyHelper = api.history;
    const fontHelper = api.font;

    emitter.on('alert', function (data, response) {
        alert(data);
        response();
    });

    emitter.on('history.undo', function (data, response) {
        historyHelper.undo();
        response();
    });

    emitter.on('font.getLocalFonts', function (data, response) {
        var fonts = fontHelper.getLocalFonts();
        response(emitter.createResponse(0, fonts));
    });
})();
