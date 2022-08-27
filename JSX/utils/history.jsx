api.history = (function () {
    function undo() {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putEnumerated(
            stringIDToTypeID('historyState'),
            stringIDToTypeID('ordinal'),
            stringIDToTypeID('previous'),
        );
        desc.putReference(stringIDToTypeID('null'), ref);
        executeAction(stringIDToTypeID('select'), desc, DialogModes.NO);
    }

    return {
        undo: undo,
    };
})();
