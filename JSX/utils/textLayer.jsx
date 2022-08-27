api.textLayer = (function () {
    const docHelper = api.document;
    const layerHelper = api.layer;
    const AMLayerKind = api.AMLayerKind;

    // !: 有可能 PSD 文字图层读取不到字体信息，目前统一识别为这个默认字体
    const defaultTextStyle = {
        fontPostScriptName: 'AdobeHeitiStd-Regular',
        fontStyleName: 'R',
        fontName: 'Adobe Heiti Std',
    };

    /**
     * @param {number} layerID
     * @returns {TextKey}
     */
    function getTextInfo(layerID) {
        return layerHelper.getLayerProperty(layerID, 'textKey', undefined);
    }

    /**
     * @returns {Record<string, Record<string, string>>}
     */
    function getFontPostScriptNames() {
        const postScriptNames = {};
        docHelper.traverseLayersDesc(
            function (values) {
                const layerID = values[0];
                const name = values[1];
                /** @type {TextKey} */
                const textKey = values[2];
                const textStyleList = textKey.textStyleRange;

                var j, stringId, textStyle, postScriptName;
                for (j = 0; j < textStyleList.length; j++) {
                    textStyle = textStyleList[j].textStyle;
                    postScriptName = textStyle.fontPostScriptName;
                    stringId = String(layerID);
                    if (!(postScriptName in postScriptNames)) {
                        postScriptNames[postScriptName] = {};
                    }
                    postScriptNames[postScriptName][stringId] = name;
                }
            },
            ['layerID', 'name', 'textKey'],
            AMLayerKind.TextSheet,
        );
        return postScriptNames;
    }

    /**
     * 判断文字图层字体数据是否丢失
     * 如果丢失了访问 textItem.font 会报错
     * @param {ArtLayer} textLayer
     * @returns
     */
    function isFontInfoLost(textLayer) {
        try {
            // eslint-disable-next-line no-unused-expressions
            textLayer.textItem.font;
        } catch (error) {
            return true;
        }
        return false;
    }

    /**
     * 替换图层中指定字体为另外一种字体，支持富文本
     * @param {number} textLayerId
     * @param {Document} document 后面重构为不需要 document 传参
     * @param {string} oldFontPostScriptName
     * @param {string} newFontPostScriptName
     * @returns {boolean} 是否有实际替换过部分字体
     */
    function replaceFont(textLayerId, document, oldFontPostScriptName, newFontPostScriptName) {
        var ref = new ActionReference();
        ref.putProperty(TypeID.property, s2t('textKey'));
        ref.putIdentifier(TypeID.layer, textLayerId);
        /** @type {ActionDescriptor} */
        var textKey = executeActionGet(ref).getObjectValue(s2t('textKey'));
        var contents = textKey.getString(s2t('textKey'));
        var styleRangeList = textKey.getList(s2t('textStyleRange'));
        var textLayer = layerHelper.getLayerById(textLayerId, activeDocument);

        // 如果不是富文本直接改 textItem.font
        if (!isFontInfoLost(textLayer) && styleRangeList.count === 1) {
            if (!canFontRenderText(newFontPostScriptName, contents)) {
                return false;
            } else {
                textLayer.textItem.font = newFontPostScriptName;
            }
        }

        // 判断是否都能替换
        var i, styleRange, style, fontPostScriptName, from, to, end, rangeText, newStyle;
        for (i = 0; i < styleRangeList.count; i++) {
            styleRange = styleRangeList.getObjectValue(i);
            /** @type {ActionDescriptor} */
            style = styleRange.getObjectValue(s2t('textStyle'));
            fontPostScriptName = style.hasKey(s2t('fontPostScriptName'))
                ? style.getString(s2t('fontPostScriptName'))
                : defaultTextStyle.fontPostScriptName;
            if (fontPostScriptName === oldFontPostScriptName) {
                from = styleRange.getString(s2t('from'));
                to = styleRange.getString(s2t('to'));
                // !: 如果是最后一段 range, to 需要减一，可能是因为底层 c++ 最后以 \0 结尾
                end = i === styleRangeList.count - 1 ? to - 1 : to;
                rangeText = contents.slice(from, end);
                // 有一个不能替换那就都别替换
                if (!canFontRenderText(newFontPostScriptName, rangeText)) {
                    return false;
                }
            }
        }

        var newStyleRangeList = new ActionList();
        for (i = 0; i < styleRangeList.count; i++) {
            styleRange = styleRangeList.getObjectValue(i);
            /** @type {ActionDescriptor} */
            style = styleRange.getObjectValue(s2t('textStyle'));
            fontPostScriptName = style.hasKey(s2t('fontPostScriptName'))
                ? style.getString(s2t('fontPostScriptName'))
                : defaultTextStyle.fontPostScriptName;
            if (fontPostScriptName === oldFontPostScriptName) {
                newStyle = new ActionDescriptor();
                // 父 ad 需要是新的才会 set 成功
                newStyle.fromStream(style.toStream());
                // !: 替换字体
                newStyle.putString(s2t('fontPostScriptName'), newFontPostScriptName);
                styleRange.putObject(s2t('textStyle'), s2t('textStyle'), newStyle);
                newStyleRangeList.putObject(s2t('textStyleRange'), styleRange);
            }
        }

        if (newStyleRangeList.count !== 0) {
            textKey.putList(s2t('textStyleRange'), newStyleRangeList);
            var setDesc = new ActionDescriptor();
            var textLayerRef = new ActionReference();
            textLayerRef.putIdentifier(TypeID.layer, textLayerId);
            setDesc.putReference(TypeID.null, textLayerRef);
            setDesc.putObject(s2t('to'), s2t('textLayer'), textKey);
            executeAction(s2t('set'), setDesc, DialogModes.NO);
        }

        return true;
    }

    /**
     * 测试字体是否能够正常渲染某段文本
     * @param {string} fontPostScriptName
     * @param {string} text
     * @returns {boolean}
     */
    function canFontRenderText(fontPostScriptName, text) {
        if (app.documents.length === 0) {
            throw new Error('No document opened now!');
        }

        var textLayer = activeDocument.artLayers.add();
        textLayer.kind = LayerKind.TEXT;
        textLayer.name = 'test font render text';
        textLayer.visible = false;

        /** @type {TextItem} */
        var textItem = textLayer.textItem;
        textItem.kind = TextType.PARAGRAPHTEXT;
        textItem.contents = text;
        // var fontSize = 200;
        // textItem.size = fontSize;
        // textItem.width = new UnitValue(text.length * fontSize + ' pixels');
        // textItem.height = new UnitValue('200 pixels');
        textItem.font = fontPostScriptName;
        if (textItem.font !== fontPostScriptName) {
            return false;
        }

        var ref = new ActionReference();
        ref.putProperty(TypeID.property, s2t('textKey'));
        ref.putIdentifier(TypeID.layer, textLayer.id);
        /** @type {ActionDescriptor} */
        var textKey = executeActionGet(ref).getObjectValue(s2t('textKey'));
        if (!textKey.hasKey(s2t('textStyleRange'))) {
            return true;
        }

        var result = textKey.getList(s2t('textStyleRange')).count === 1;
        textLayer.remove();
        return result;
    }

    return {
        defaultTextStyle: defaultTextStyle,
        isFontInfoLost: isFontInfoLost,
        getTextInfo: getTextInfo,
        replaceFont: replaceFont,
        canFontRenderText: canFontRenderText,
        getFontPostScriptNames: getFontPostScriptNames,
    };
})();
