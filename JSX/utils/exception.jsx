api.exception = (function () {
    function getErrorDetails(e) {
        var name = e.name;
        var line = e.line;
        var fileName = e.fileName;
        var description = e.description;
        var sourceLine = e.source.split(/[\r\n]/)[line - 1];
        var errorDetails = name + ' ' + e.number + ': ' + description + '\nat:';
        errorDetails += '\n  File: ' + fileName;
        errorDetails +=
            '\n  Line: ' +
            line +
            ' -> ' +
            (sourceLine.length < 300 ? sourceLine : sourceLine.substring(0, 300) + '...');

        if (e.start) {
            errorDetails += '\nBug: ' + e.source.substring(e.start - 1, e.end);
        }

        return errorDetails;
    }

    return {
        getErrorDetails: getErrorDetails,
    };
})();
