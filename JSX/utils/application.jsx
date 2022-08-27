api.application = (function () {
    var fs = api.fs;
    var isMac = api.constants.isMac;

    /**
     * @param {number} delay
     */
    function launchOnWindows(delay) {
        const tempShellFile = new File(Folder.temp.fsName);
        tempShellFile.changePath('launchPhotoshop.vbs');
        $.writeln(tempShellFile.fsName);

        const photoshopExe = app.path.fsName + '\\Photoshop.exe';
        // prettier-ignore
        const script = 'WScript.Sleep ' + delay + '\n' +
        'Dim objShell\n' +
        'Set objShell = WScript.CreateObject( "WScript.Shell" )\n' +
        'objShell.Run("""' + photoshopExe + '""")\n' +
        'Set objShell = Nothing';

        $.writeln(script);
        fs.writeTextSync(tempShellFile, script);

        const command = 'start "" /B /MIN "' + tempShellFile.fsName + '" && exit 0';
        $.writeln(command);
        system(command);
    }

    /**
     * @param {number} delay
     */
    function launchOnMac(delay) {
        const tempShellFile = new File(Folder.temp.fsName);
        tempShellFile.changePath('launchPhotoshop.sh');
        $.writeln(tempShellFile.fsName);

        const script = 'sleep ' + delay / 1000 + " && open -a '" + app.path.displayName + "'";
        $.writeln(script);
        fs.writeTextSync(tempShellFile, script);

        const command = "source '" + tempShellFile.fsName + "' &";
        $.writeln(command);
        system(command);
    }

    function restart(launchDelay) {
        if (launchDelay === undefined) launchDelay = 1000;

        // 保存所以文档
        const documents = app.documents;
        if (documents.length) {
            for (var i = 0; i < documents.length; i++) {
                documents[i].save(SaveOptions.PROMPTTOSAVECHANGES);
            }
        }

        if (isMac) {
            launchOnMac(launchDelay);
        } else {
            launchOnWindows(launchDelay);
        }

        photoshop.quit();
    }

    return {
        launchOnMac: launchOnMac,
        launchOnWindows: launchOnWindows,
        restart: restart,
    };
})();
