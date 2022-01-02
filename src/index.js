const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const ipcMain = electron.ipcMain
const { Client, Authenticator } = require('minecraft-launcher-core');
const fs = require('fs')
const { autoUpdater } = require('electron-updater');
const msmc = require("msmc");
const fetch = require('node-fetch');

const {downloadModsList} = require('./components/functions/downloads')
const {checkLauncherPaths, checkForge, checkJava, checkMods} = require('./components/functions/checkFolders');
const { launchGame, getRam, launchGameWithMojang, launchGameWithMS } = require('./components/functions/launchGame');

let mainWindow;

let launcherPath = app.getPath('appData') + '\\KarasiaLauncher\\'
let launcherModsPath = app.getPath('appData') + '\\KarasiaLauncher\\mods\\'
let launcherJavaPath = app.getPath('appData') + '\\KarasiaLauncher\\Java\\'
let MSResult

downloadModsList(launcherPath).then(msg => {
  console.log(msg)
})

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
    if(fs.existsSync(app.getPath('appData') + '\\KarasiaLauncher\\infos.json')){
			let rawdata = fs.readFileSync(app.getPath('appData') + '\\KarasiaLauncher\\infos.json');
			let student = JSON.parse(rawdata);
      mainWindow.webContents.send('savedID', {student})
		}
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

//Login player with MS
ipcMain.on('loginMS', (event, data) => {
  msmc.setFetch(fetch)
  msmc.fastLaunch("raw", (update) => {

  }).then(result => {
    if (msmc.errorCheck(result)){
      console.log(result.reason)
      return;
    }
    console.log(result)
    result.profile
    MSResult = result
    mainWindow.loadURL(`file://${__dirname}/components/views/main.html`)
    mainWindow.webContents.once('dom-ready', () => {
      mainWindow.webContents.send('MSData', result.profile)
    })
  })
})

//Login player with Mojang
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

ipcMain.on('saveID', (event, data) => {
  if(fs.existsSync(launcherPath + 'infos.json')){

    let rawdata = fs.readFileSync(launcherPath + 'infos.json')

    let student = JSON.parse(rawdata);

    if(student.infos[0].email === data.email){
      return false
    }else{
      student.infos.push({email: data})
      let json = JSON.stringify(student)
      fs.writeFileSync(launcherPath + 'infos.json', json)
    }

  }else{

    let ID = {"infos": [
      {email: data.email}
    ]}
    let datsa = JSON.stringify(ID)
    fs.writeFileSync(launcherPath + 'infos.json', datsa)

  }
})

//Launch the Minecraft Client
ipcMain.on('Play', async (event, data) => {

  if(MSResult === undefined){
    checkLauncherPaths(launcherPath, launcherModsPath, launcherJavaPath).then( async result => {
      if(result === true || "Dossier crée avec succés"){
        await checkForge(launcherPath, event)
        await checkMods(launcherPath, launcherModsPath, event)
        await checkJava(launcherJavaPath, event)
        await getRam(launcherPath).then(async ram => {
          await launchGameWithMojang(ram, data.userEmail, data.userPaswword, launcherJavaPath, launcherPath, mainWindow, event)
        })
      }
    })
  }else{
    checkLauncherPaths(launcherPath, launcherModsPath, launcherJavaPath).then( async result => {
      if(result === true || "Dossier crée avec succés"){
        await checkForge(launcherPath, event)
        await checkMods(launcherPath, launcherModsPath, event)
        await checkJava(launcherJavaPath, event)
        await getRam(launcherPath).then(async ram => {
          await launchGameWithMS(ram, MSResult, launcherJavaPath, launcherPath, mainWindow, event)
        })
      }
    })
  }
})

//Change page
ipcMain.on('GoToMain', (event, data) => {
  mainWindow.loadURL(`file://${__dirname}/components/views/main.html`)
  console.log(data)
  let datas = {"username" : data.username, "uuid": data.uuid, "email": data.email, "password": data.password}
  mainWindow.webContents.once('dom-ready', () => {
    mainWindow.webContents.send('usernameData', datas)
  })
})

//Change page
ipcMain.on('GoToSettings', (event, data) => {
  mainWindow.loadURL(`file://${__dirname}/components/views/settings.html`)
  if(fs.existsSync(launcherPath + 'infos.json')){

    let rawdata = fs.readFileSync(launcherPath + 'infos.json')

    let student = JSON.parse(rawdata);

    if(student['infos'][1] === null){
    }else{
      let datas = {"username" : data.userName, "uuid": data.userUUID, "email": data.userEmail, "password": data.userPaswword, "ram": student['infos'][1]}
      mainWindow.webContents.once('dom-ready', () => {
        mainWindow.webContents.send('usernameDataWithRam', datas)
      })
    }

  }else{
    let datas = {"username" : data.userName, "uuid": data.userUUID, "email": data.userEmail, "password": data.userPaswword}
    mainWindow.webContents.once('dom-ready', () => {
      mainWindow.webContents.send('usernameDataWithoutRam', datas)
    })
  }
})

ipcMain.on('saveRam', (event, data) => {
  if(fs.existsSync(launcherPath + 'infos.json')){

    let rawdata = fs.readFileSync(launcherPath + 'infos.json')

    let student = JSON.parse(rawdata);

    if(student.infos[0].ram === data){
      return false
    }else{
      student.infos.push({ram: data})
      let json = JSON.stringify(student)
      fs.writeFileSync(launcherPath + 'infos.json', json)
    }

  }else{

    let ID = {"infos": [
      {ram: data.ram}
    ]}
    let datsa = JSON.stringify(ID)
    fs.writeFileSync(launcherPath + 'infos.json', datsa)

  }
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