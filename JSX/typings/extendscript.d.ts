const activeDocument: typeof app.activeDocument;
const photoshop: {
    quit(): void;
};

const executeAction: typeof app.executeAction;
const executeActionGet: typeof app.executeActionGet;

const charIDToTypeID: typeof app.charIDToTypeID;
const stringIDToTypeID: typeof app.stringIDToTypeID;
const typeIDToStringID: typeof app.typeIDToStringID;
const typeIDToCharID: typeof app.typeIDToCharID;
const s2t: (stringID: StringID) => number;
const c2t: typeof app.charIDToTypeID;

function system(command: string): number;

interface Document {
    layers: Array<LayerSet & ArtLayer>;
}

interface LayerSet {
    layers: Array<LayerSet & ArtLayer>;
}
