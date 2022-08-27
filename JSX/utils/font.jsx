api.font = (function () {
    function getLocalFonts() {
        const fontInfoList = [];
        const fonts = app.fonts;
        for (var i = 0, font, fontInfo; i < fonts.length; i++) {
            font = fonts[i];
            fontInfo = {
                name: font.name,
                family: font.family,
                style: font.style,
                postScriptName: font.postScriptName,
            };
            fontInfoList.push(fontInfo);
        }
        return fontInfoList;
    }

    return {
        getLocalFonts: getLocalFonts,
    };
})();
