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
let launcherModsPath = app.getPath('appData') + '\\KarasiaLauncher\\mods\\'

const downloader = new Downloader({
  url: "http://localhost/modsList.json",
  directory: launcherPath, 
});

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

  mainWindow.loadURL(`file://${__dirname}/components/views/login.html`); // on doit charger un chemin absolu

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
ipcMain.on('Play', async (event, data) => {

  let jsonMods = []
  let folderMods = []

  if(fs.existsSync(launcherPath)){

    if(fs.existsSync(launcherModsPath)){

      fs.readdirSync(launcherModsPath).forEach(file => {
        folderMods.push(file)
      })

      try {
        await downloader.download()

        let modsData = fs.readFileSync(launcherPath + "modsList.json")
        let jsonData = JSON.parse(modsData)

        await jsonData.forEach(element => {
          jsonMods.push(element.name)
        });

        let difference = jsonMods.filter(x => !folderMods.includes(x));
        
        if(difference.length >= 1){
          difference.forEach( async element => {
            let downloaderMissedMods = new Downloader({
              url: "http://localhost/mods/" + element,
              directory: launcherModsPath
            })

            await downloaderMissedMods.download()
          })
          console.log('Mods manquant recupere !')
        }else{

          let opts = {
            clientPackage: null,
            authorization: Authenticator.getAuth(data.email, data.password),
            root: launcherPath,
            forge: launcherPath + "forge.jar",
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
        }

      } catch (error) {
        console.log(error)
      }
    }else{
      
    }

  }else{
    fs.mkdirSync(launcherPath)
    fs.mkdirSync(launcherModsPath)

    let downloaderForge = new Downloader({
      url: "http://localhost/forge.jar",
      directory: launcherPath
    })

    await downloaderForge.download()

    await downloader.download()

    let modsData = fs.readFileSync(launcherPath + "modsList.json")
    let jsonData = JSON.parse(modsData)

    await jsonData.forEach(element => {
      let downloaderMods = new Downloader({
        url: "http://localhost/mods/" + element.name,
        directory: launcherModsPath
      })

      downloaderMods.download()
    });

    let opts = {
      clientPackage: null,
      authorization: Authenticator.getAuth(data.email, data.password),
      root: launcherPath,
      forge: launcherPath + "forge.jar",
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

  }

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