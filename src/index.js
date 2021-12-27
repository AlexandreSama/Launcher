const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const ipcMain = electron.ipcMain
const { Client, Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();
const fs = require('fs')
const Downloader = require("nodejs-file-downloader");

let mainWindow;

let launcherPath = app.getPath('appData') + '\\KarasiaLauncher\\'

function createWindow () {

  mainWindow = new BrowserWindow({
    width: 1800, 
    height: 1200,
    enableRemoteModule: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  }); // on définit une taille pour notre fenêtre

  mainWindow.loadURL(`file://${__dirname}/components/views/settings.html`); // on doit charger un chemin absolu

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

//Login player
ipcMain.on('login', (event, data) => {
  Authenticator.getAuth(data.email, data.password).then(e => {
    console.log(e)
    let datas = {"username" : e.name, "uuid": e.uuid, "email": data.email, "password": data.password}
    mainWindow.loadURL(`file://${__dirname}/components/views/main.html`)
    mainWindow.webContents.once('dom-ready', () => {
      mainWindow.webContents.send('usernameData', datas)
    })
  }).catch(err => {
    event.sender.send('Error-Login')
  })
})

//Launch the Minecraft Client
ipcMain.on('Play', (event, data) => {

  if(fs.existsSync(launcherPath)){
    console.log('Dossier déjà crée !')
  }else{
    fs.mkdirSync(launcherPath)
  }

  let opts = {
    clientPackage: null,
    authorization: Authenticator.getAuth(data.email, data.password),
    root: launcherPath,
    version: {
        number: "1.12.2",
        type: "release"
    },
    memory: {
        max: "6G",
        min: "4G"
    }
  }

  launcher.launch(opts);

  launcher.on('progress', (e) => {
    let type = e.type
    let task = e.task
    let total = e.total
    event.sender.send('dataDownload', (event, {type, task, total}))
  })

})

//Change page
ipcMain.on('GoToMain', (event, data) => {
  mainWindow.loadURL(`file://${__dirname}/components/views/main.html`)
  let datas = {"username" : data.name, "uuid": data.uuid, "email": data.email, "password": data.password}
  mainWindow.webContents.once('dom-ready', () => {
    mainWindow.webContents.send('usernameData', datas)
  })
})

//Change page
ipcMain.on('GoToSettings', (event, data) => {
  mainWindow.loadURL(`file://${__dirname}/components/views/settings.html`)
  let datas = {"username" : data.name, "uuid": data.uuid, "email": data.email, "password": data.password}
  mainWindow.webContents.once('dom-ready', () => {
    mainWindow.webContents.send('usernameData', datas)
  })
})