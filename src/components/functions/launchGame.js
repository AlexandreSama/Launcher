const { Client, Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();

async function launchGame(ram, email, password, javaExePath, RootPath, forgePath, event) {
    let opts = {
        clientPackage: null,
        authorization: Authenticator.getAuth(data.email, data.password),
        root: launcherPath,
        forge: launcherPath + "forge.jar",
        javaPath: path.join(launcherJavaPath + 'bin\\java.exe'),
        version: {
            number: "1.12.2",
            type: "release"
        },
        memory: {
            max: ram,
            min: "4000"
        }
    }

    launcher.launch(opts);

    launcher.on('progress', (e) => {
      let type = e.type
      let task = e.task
      let total = e.total
      event.sender.send('dataDownload', ({type, task, total}))
    })
    launcher.on('debug', (e) => {
      mainWindow.webContents.send('dataMc', {e})
    })
    launcher.on('data', (e) => {
      mainWindow.webContents.send('dataMcd', {e})
    })
}