/**
 *
 * Descriptor-Info
 * JSX script to recursively get all the properties in an ActionDescriptor used in Adobe applications
 *
 * Author: Javier Aroche (https://github.com/JavierAroche)
 * Repo: https://github.com/JavierAroche/descriptor-info
 * Version: v1.1.0
 * License MIT
 *
 */

function getDefaultParams() {
    return {
        reference: false,
        extended: false,
        maxRawLimit: 10000,
        maxXMPLimit: 10000,
        includeKeys: ['*'],
        excludeKeys: ['XMPMetadataAsUTF8'],
    };
}

api.descriptorInfo = (function () {
    var parsePropPathStrToArray = api._.parsePropPathStrToArray;

    /**
     * @param {DescValueType} descType
     * @returns {boolean}
     */
    function isCompoundDescValueType(descType) {
        return descType === 'DescValueType.OBJECTTYPE' || descType === 'DescValueType.LISTTYPE';
    }

    /**
     * Descriptor Info constructor.
     * @constructor
     */
    function DescriptorInfo() {
        this.descParams = getDefaultParams();
    }

    /**
     * @public
     * Handler function to get Action Descriptor properties
     * @param {Object} Action Descriptor
     * @param {Object} Optional params object
     * 	@param {Boolean} reference - return reference descriptors. Could slightly affect speed. Default = false.
     * 	@param {Boolean} extended - returns extended information about the descriptor. Default = false.
     * 	@param {Number} maxRawLimit - limits the max number of characters from a RAWTYPE descriptor. Default = 10000.
     * 	@param {Number} maxXMPLimit - limits the max number of characters from an XMPMetadataAsUTF8 property. Default = 10000.
     * 	@param {String} saveToFile - Saves the descriptor to a JSON file. Default = '~/Desktop/descriptor-info.json'.
     */
    DescriptorInfo.prototype.getProperties = function (desc, params) {
        params = params || {};
        Object.assign(this.descParams, params);

        var descObject;
        if (desc instanceof ActionList) {
            descObject = this._getDescList(desc);
        } else {
            descObject = this._getDescObject(desc, {});
        }

        if (this.descParams.saveToFile) {
            this._saveToFile(descObject, this.descParams.saveToFile);
        }

        // reset params
        this.descParams = getDefaultParams();

        return descObject;
    };

    /**
     * 获取 ActionDescriptor 某个属性路径的值
     * @param {ActionDescriptor | ActionList} desc
     * @param {string | Array<string|number>} path
     * @param {any} defaultValue
     */
    DescriptorInfo.prototype.get = function (desc, path, defaultValue) {
        if (!(Array.isArray(path) || typeof path === 'string')) {
            throw Error('The path: ' + path + 'is neither array nor string!');
        }

        if (!(desc instanceof ActionDescriptor || desc instanceof ActionList)) {
            throw new Error('desc must be ActionDescriptor or ActionList!');
        }

        var propPath = Array.isArray(path) ? path : parsePropPathStrToArray(path);
        var value = desc;
        var key, keyTypeID, /** @type {DescValueType} */ itemDescType;
        while (propPath.length && value != null) {
            key = propPath.shift();
            itemDescType = undefined;
            keyTypeID = undefined;

            if (value instanceof ActionDescriptor) {
                keyTypeID = TypeID[key] || s2t(key);
                if (!value.hasKey(keyTypeID)) {
                    value = undefined;
                    break;
                }
            } else if (value instanceof ActionList) {
                if (typeof key !== 'number') {
                    value = undefined;
                    break;
                } else {
                    keyTypeID = key;
                }
            } else {
                break;
            }

            itemDescType = value.getType(keyTypeID).toString();
            value = this._getValue(value, itemDescType, keyTypeID);

            if (value instanceof ActionReference) {
                value = '<ActionReference>';
            }

            if (!isCompoundDescValueType(itemDescType)) break;
        }

        if (isCompoundDescValueType(itemDescType)) {
            value = this.getProperties(value);
        }

        if (propPath.length === 0 && value === null) return null;

        return value == null ? defaultValue : value;
    };

    /**
     * @private
     * Handler function to get the items in an ActionDescriptor Object
     * @param {ActionDescriptor} desc
     * @param {object} descObject Empty object to return (required since it's a recursive function)
     */
    DescriptorInfo.prototype._getDescObject = function (desc, descObject, level) {
        var nextLevel = (level || 0) + 1;

        for (var i = 0; i < desc.count; i++) {
            var typeID = desc.getKey(i);
            var descType = desc.getType(typeID).toString();

            var descProperties,
                descStringID = typeIDToStringID(typeID),
                descCharID = typeIDToCharID(typeID);

            if (nextLevel === 1) {
                var isIncluded = this.descParams.includeKeys.some(function (k) {
                    return k === '*' || k === descStringID;
                });
                var isExcluded = this.descParams.excludeKeys.includes(descStringID);
                var included = isIncluded && !isExcluded;
                if (!included) continue;
            }

            if (this.descParams.extended) {
                descProperties = {
                    stringID: descStringID,
                    charID: descCharID,
                    id: typeID,
                    key: i,
                    type: descType,
                    value: this._getValue(desc, descType, typeID),
                };
            } else {
                descProperties = this._getValue(desc, descType, typeID);
            }

            var objectName = this._getBestName(typeID);

            switch (descType) {
                case 'DescValueType.OBJECTTYPE':
                    if (this.descParams.extended) {
                        descProperties.object = this._getDescObject(
                            descProperties.value,
                            {},
                            nextLevel,
                        );
                    } else {
                        descProperties = this._getDescObject(descProperties, {}, nextLevel);
                    }
                    break;

                case 'DescValueType.LISTTYPE':
                    if (this.descParams.extended) {
                        descProperties.list = this._getDescList(descProperties.value, nextLevel);
                    } else {
                        descProperties = this._getDescList(descProperties, nextLevel);
                    }
                    break;

                case 'DescValueType.ENUMERATEDTYPE':
                    descProperties.enumerationType = typeIDToStringID(
                        desc.getEnumerationType(typeID),
                    );
                    break;

                case 'DescValueType.REFERENCETYPE':
                    if (this.descParams.reference) {
                        var referenceValue;

                        if (this.descParams.extended) {
                            referenceValue = descProperties.value;
                        } else {
                            referenceValue = descProperties;
                        }

                        try {
                            descProperties.actionReference =
                                this._getActionReferenceInfo(referenceValue);
                        } catch (err) {
                            $.writeln('Unable to get value: ' + descStringID + ' - ' + err);
                        }

                        try {
                            descProperties.actionReferenceContainer = this._getActionReferenceInfo(
                                referenceValue.getContainer(),
                            );
                        } catch (err) {
                            $.writeln('Unable to get container: ' + descStringID + ' - ' + err);
                        }

                        try {
                            descProperties.reference = executeActionGet(referenceValue);
                        } catch (err) {
                            $.writeln(
                                'Unable to run executeActionGet from value: ' +
                                    descStringID +
                                    ' - ' +
                                    err,
                            );
                        }

                        try {
                            descProperties.referenceContainer = executeActionGet(
                                referenceValue.getContainer(),
                            );
                        } catch (err) {
                            $.writeln(
                                'Unable to run executeActionGet from container: ' +
                                    descStringID +
                                    ' - ' +
                                    err,
                            );
                        }
                    }
                    break;

                default:
                    break;
            }

            descObject[objectName] = descProperties;
        }

        return descObject;
    };

    /**
     * @private
     * Handler function to get the items in an ActionList
     * @param {Object} Action List
     */
    DescriptorInfo.prototype._getDescList = function (list, level) {
        var nextLevel = (level || 0) + 1;
        var listArray = [];

        for (var ii = 0; ii < list.count; ii++) {
            var listItemType = list.getType(ii).toString();
            var listItemValue = this._getValue(list, listItemType, ii);

            switch (listItemType) {
                case 'DescValueType.OBJECTTYPE':
                    // var listItemOBJ = {};

                    var listItemProperties,
                        descStringID = typeIDToStringID(list.getObjectType(ii));

                    if (this.descParams.extended) {
                        listItemProperties = {
                            stringID: descStringID,
                            key: ii,
                            type: listItemType,
                            value: listItemValue,
                        };

                        listItemProperties.object = this._getDescObject(listItemValue, {});
                    } else {
                        listItemProperties = this._getDescObject(listItemValue, {});
                    }

                    listArray.push(listItemProperties);
                    break;

                case 'DescValueType.LISTTYPE':
                    listArray.push(this._getDescList(listItemValue, nextLevel));
                    break;

                case 'DescValueType.REFERENCETYPE':
                    if (this.descParams.reference) {
                        var referenceProperties = {};

                        try {
                            referenceProperties.actionReference =
                                this._getActionReferenceInfo(listItemValue);
                        } catch (err) {
                            $.writeln('Unable to get value: ' + descStringID + ' - ' + err);
                        }

                        try {
                            referenceProperties.actionReferenceContainer =
                                this._getActionReferenceInfo(listItemValue.getContainer());
                        } catch (err) {
                            $.writeln('Unable to get container: ' + descStringID + ' - ' + err);
                        }

                        try {
                            referenceProperties.reference = executeActionGet(listItemValue);
                        } catch (err) {
                            $.writeln(
                                'Unable to run executeActionGet from value: ' +
                                    descStringID +
                                    ' - ' +
                                    err,
                            );
                        }

                        try {
                            referenceProperties.referenceContainer = executeActionGet(
                                listItemValue.getContainer(),
                            );
                        } catch (err) {
                            $.writeln(
                                'Unable to run executeActionGet from container: ' +
                                    descStringID +
                                    ' - ' +
                                    err,
                            );
                        }

                        listArray.push(referenceProperties);
                    } else {
                        listArray.push(listItemValue);
                    }
                    break;

                default:
                    listArray.push(listItemValue);
                    break;
            }
        }

        return listArray;
    };

    /**
     * @private
     *
     * Based on code by Michael Hale
     * http://www.ps-scripts.com/
     *
     * Handler function to get the value of an Action Descriptor
     * @param {ActionDescriptor} desc
     * @param {string} descType Descriptor type
     * @param {number} position Key / Index
     */
    DescriptorInfo.prototype._getValue = function (desc, descType, position) {
        switch (descType) {
            case 'DescValueType.BOOLEANTYPE':
                return desc.getBoolean(position);

            case 'DescValueType.CLASSTYPE':
                return desc.getClass(position);

            case 'DescValueType.DOUBLETYPE':
                return desc.getDouble(position);

            case 'DescValueType.ENUMERATEDTYPE':
                return typeIDToStringID(desc.getEnumerationValue(position));

            case 'DescValueType.INTEGERTYPE':
                return desc.getInteger(position);

            case 'DescValueType.LISTTYPE':
                return desc.getList(position);

            case 'DescValueType.OBJECTTYPE':
                return desc.getObjectValue(position);

            case 'DescValueType.REFERENCETYPE':
                return desc.getReference(position);

            case 'DescValueType.STRINGTYPE':
                var str = '';
                if (typeIDToStringID(position) === 'XMPMetadataAsUTF8') {
                    return (
                        str +
                        JSON.stringify(desc.getString(position)).substring(
                            0,
                            this.descParams.maxXMPLimit,
                        )
                    );
                } else {
                    return str + desc.getString(position);
                }

            case 'DescValueType.UNITDOUBLE':
                return desc.getUnitDoubleValue(position);

            case 'DescValueType.ALIASTYPE':
                return decodeURI(desc.getPath(position));

            case 'DescValueType.RAWTYPE':
                return desc.getData(position).substring(0, this.descParams.maxRawLimit);

            case 'ReferenceFormType.CLASSTYPE':
                return desc.getDesiredClass();

            case 'ReferenceFormType.ENUMERATED':
                var enumeratedID = desc.getEnumeratedValue();
                return this._getBestName(enumeratedID);

            case 'ReferenceFormType.IDENTIFIER':
                return desc.getIdentifier();

            case 'ReferenceFormType.INDEX':
                return desc.getIndex();

            case 'ReferenceFormType.NAME':
                str = '';
                return str + desc.getName();

            case 'ReferenceFormType.OFFSET':
                return desc.getOffset();

            case 'ReferenceFormType.PROPERTY':
                var propertyID = desc.getProperty();
                return this._getBestName(propertyID);

            default:
                break;
        }
    };

    /**
     * @private
     *
     * Handler function to get the info about action reference
     * @param {Object} Action Reference
     */
    DescriptorInfo.prototype._getActionReferenceInfo = function (reference) {
        var form = reference.getForm().toString();
        var classID = reference.getDesiredClass();
        var info;

        if (this.descParams.extended) {
            info = {
                stringID: typeIDToStringID(classID),
                charID: typeIDToCharID(classID),
                id: classID,
                type: form,
                value: this._getValue(reference, form, 0),
            };
        } else {
            info = this._getValue(reference, form, 0);
        }

        return info;
    };

    /**
     * Handler function to get the best name for typeID
     * @private
     * @param {number} typeID
     * @returns {string}
     */
    DescriptorInfo.prototype._getBestName = function (typeID) {
        var stringValue = typeIDToStringID(typeID);
        var charValue = typeIDToCharID(typeID);

        if (stringValue) {
            return stringValue;
        } else if (charValue) {
            return charValue;
        } else {
            return typeID + '';
        }
    };

    /**
     * @private
     *
     * Handler function to save descriptor into a file
     * @param {String} descriptor
     */
    DescriptorInfo.prototype._saveToFile = function (descriptor, outputFile) {
        outputFile = new File(outputFile);

        if (outputFile.exists) {
            outputFile.remove();
        }

        outputFile.encoding = 'UTF8';
        outputFile.open('e', 'TEXT', '????');
        outputFile.writeln(JSON.stringify(descriptor, null, 4));
        outputFile.close();
    };

    return new DescriptorInfo();
})();
