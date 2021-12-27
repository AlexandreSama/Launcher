const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const ipcMain = electron.ipcMain
const { Client, Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();
const fs = require('fs')
const Downloader = require("nodejs-file-downloader");
const { autoUpdater } = require('electron-updater');
const AdmZip = require("adm-zip");

let mainWindow;

let launcherPath = app.getPath('appData') + '\\KarasiaLauncher\\'
let launcherModsPath = app.getPath('appData') + '\\KarasiaLauncher\\mods\\'
let launcherJavaPath = app.getPath('appData') + '\\KarasiaLauncher\\Java\\'

const downloader = new Downloader({
  url: "http://193.168.146.71/modsList.json",
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
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify()
  })
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

  //If the folder for the launcher is already created
  if(fs.existsSync(launcherPath)){

    //If the folder for the mods is already created, check mods, download missing mods and launch the game
    if(fs.existsSync(launcherModsPath)){

      if(fs.existsSync(launcherJavaPath + "java.exe")){

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
                url: "http://193.168.146.71/mods/" + element,
                directory: launcherModsPath
              })
  
              await downloaderMissedMods.download()
            })
            console.log('Mods manquant recupere !')
  
            let opts = {
              clientPackage: null,
              authorization: Authenticator.getAuth(data.email, data.password),
              root: launcherPath,
              forge: launcherPath + "forge.jar",
              javaPath: path.join(launcherJavaPath + 'java.exe'),
              version: {
                  number: "1.12.2",
                  type: "release"
              },
              memory: {
                  max: "6G",
                  min: "4G"
              }
            }
  
            fs.unlinkSync(launcherPath + "modsList.json")
  
            launcher.launch(opts);
  
            launcher.on('progress', (e) => {
              let type = e.type
              let task = e.task
              let total = e.total
              event.sender.send('dataDownload', (event, {type, task, total}))
            })
  
          }else{
  
            let opts = {
              clientPackage: null,
              authorization: Authenticator.getAuth(data.email, data.password),
              root: launcherPath,
              forge: launcherPath + "forge.jar",
              javaPath: path.join(launcherJavaPath + 'java.exe'),
              version: {
                  number: "1.12.2",
                  type: "release"
              },
              memory: {
                  max: "6G",
                  min: "4G"
              }
            }
  
            fs.unlinkSync(launcherPath + "modsList.json")
  
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

        let downloadJava = new Downloader({
          url: "http://193.168.146.71/java.zip",
          directory: launcherJavaPath
        })

        await downloadJava.download()

        var zip = new AdmZip(launcherJavaPath + 'java.zip')

        zip.extractAllTo(launcherJavaPath, true)

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
                url: "http://193.168.146.71/mods/" + element,
                directory: launcherModsPath
              })
  
              await downloaderMissedMods.download()
            })
            console.log('Mods manquant recupere !')
  
            let opts = {
              clientPackage: null,
              authorization: Authenticator.getAuth(data.email, data.password),
              root: launcherPath,
              forge: launcherPath + "forge.jar",
              javaPath: path.join(launcherJavaPath + 'java.exe'),
              version: {
                  number: "1.12.2",
                  type: "release"
              },
              memory: {
                  max: "6G",
                  min: "4G"
              }
            }
  
            fs.unlinkSync(launcherPath + "modsList.json")
  
            launcher.launch(opts);
  
            launcher.on('progress', (e) => {
              let type = e.type
              let task = e.task
              let total = e.total
              event.sender.send('dataDownload', (event, {type, task, total}))
            })
  
          }else{
  
            let opts = {
              clientPackage: null,
              authorization: Authenticator.getAuth(data.email, data.password),
              root: launcherPath,
              forge: launcherPath + "forge.jar",
              javaPath: path.join(launcherJavaPath + 'java.exe'),
              version: {
                  number: "1.12.2",
                  type: "release"
              },
              memory: {
                  max: "6G",
                  min: "4G"
              }
            }
  
            fs.unlinkSync(launcherPath + "modsList.json")
  
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

      }

    //If the folder for the mods isn't created (weird errors :think:)
    }else{

    }
  //If the folder for the launcher isn't created, create folders, download forge & mods and launch the game
  }else{
    fs.mkdirSync(launcherPath)
    fs.mkdirSync(launcherModsPath)

    let downloaderForge = new Downloader({
      url: "http://193.168.146.71/forge.jar",
      directory: launcherPath
    })

    await downloaderForge.download()

    await downloader.download()

    let downloadJava = new Downloader({
      url: "http://193.168.146.71/java.zip",
      directory: launcherJavaPath
    })

    await downloadJava.download()

    var zip = new AdmZip(launcherJavaPath + 'java.zip')

    zip.extractAllTo(launcherJavaPath, true)

    let modsData = fs.readFileSync(launcherPath + "modsList.json")
    let jsonData = JSON.parse(modsData)

    await jsonData.forEach(element => {
      let downloaderMods = new Downloader({
        url: "http://193.168.146.71/mods/" + element.name,
        directory: launcherModsPath
      })

      downloaderMods.download()
    });

    fs.unlinkSync(launcherPath + "modsList.json")

    let opts = {
      clientPackage: null,
      authorization: Authenticator.getAuth(data.email, data.password),
      root: launcherPath,
      forge: launcherPath + "forge.jar",
      javaPath: path.join(launcherJavaPath + 'java.exe'),
      version: {
          number: "1.12.2",
          type: "release"
      },
      memory: {
          max: "6000",
          min: "4000"
      }
    }

    launcher.launch(opts);

    launcher.on('progress', (e) => {
      let type = e.type
      let task = e.task
      let total = e.total
      event.sender.send('dataDownload', (event, {type, task, total}))
    })
    launcher.on('debug', (e) => {
      mainWindow.webContents.send('dataMc', {e})
    })
    launcher.on('data', (e) => {
      mainWindow.webContents.send('dataMcd', {e})
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

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available')
})

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded')
})

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall()
})