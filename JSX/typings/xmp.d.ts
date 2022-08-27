// A commonly used construct for loading XMPScript into
// ExtendScript contexts.
interface ExternalObjectConstructor {
    AdobeXMPScript: ExternalObject | undefined;
}

interface XMPMetaConstructor {
    /** Creates an empty object. */
    new (): XMPMetaInstance;
    /**
     * @param packet A string containing an XML file or an XMP packet.
     */
    new (packet: string): XMPMetaInstance;
    /**
     * @param buffer The UTF-8 or UTF-16 encoded bytes of an XML file
     * or an XMP packet. This array is the result of a call to `serializeToArray`
     * on an `XMPMeta` instance.
     */
    new (buffer: number[]): XMPMetaInstance;

    registerNamespaces(namespaceURI: string, suggestedPrefix: string): string;
    deleteNamespace(namespaceURI: string): void;
    getNamespaceURI(namespacePrefix: string): string;
    getNamespacePrefix(namespaceURI: string): string;
    dumpNamespaces(): String;
}
type XMPProperty = any;
interface XMPMetaInstance {
    doesPropertyExist(namespace: string, value: string): Boolean;
    getProperty(namespace: string, property: string): XMPProperty;
    setProperty(namespace: string, property: string, value: string): Boolean;
    countArrayItems(namespace: string, property: string): Number;
    getArrayItem(namespace: string, property: string, itemIndex: Number): XMPProperty;
    deleteProperty(namespace: string, property: string): Boolean;
    appendArrayItem(
        namespace: string,
        property: string,
        arrayOptions: string,
        valueToAppend: string,
        valueOptions: string,
    ): Boolean;
    dumpObject(): string;
    serialize(): string;
    // Instance stuff.

    // getProperty
    // getArrayItem
    // getStructField
    // getQualifier
    // setProperty
    // setArrayItem
    // insertArrayItem
    // appendArrayItem
    // countArrayItems
    // setStructField
    // setQualifier
    // deleteProperty
    // deleteArrayItem
    // deleteStructField
    // deleteQualifier
    // doesPropertyExist
    // doesArrayItemExist
    // doesStructFieldExist
    // doesQualifierExist
    // getLocalizedText
    // setLocalizedText
    // iterator
    // serialize
    // serializeToArray
    // dumpObject
    // sort
}

declare const XMPMeta: XMPMetaConstructor | undefined;

interface XMPConstConstructor {
    new (): XMPConstInstance;
    NS_DM: string;
    NS_DC: string;
    ARRAY_IS_ORDERED: string;
    // Class stuff.
}

interface XMPConstInstance {
    // Instance stuff.
}

declare const XMPConst: XMPConstConstructor | undefined;
