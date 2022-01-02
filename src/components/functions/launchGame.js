const { Client, Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();
const fs = require('fs')
const path = require('path');
const msmc = require("msmc");

async function getRam(launcherPath) {
  let rawdata = fs.readFileSync(launcherPath + 'infos.json');
  let student = JSON.parse(rawdata);
  let ram = student['infos'][1].ram

  console.log(ram)

  return ram
}

async function launchGameWithMS(ram, result, javaExePath, RootPath, mainWindow, event) {

  fs.unlinkSync(RootPath + 'modsList.json')

    let opts = {
        clientPackage: null,
        authorization: msmc.getMCLC().getAuth(result),
        root: RootPath,
        forge: RootPath + "forge.jar",
        javaPath: path.join(javaExePath + 'bin\\java.exe'),
        version: {
            number: "1.12.2",
            type: "release"
        },
        memory: {
            max: ram,
            min: "4G"
        }
    }

    launcher.launch(opts);

    launcher.on('progress', (e) => {
      let type = e.type
      let task = e.task
      let total = e.total
      event.sender.send('dataDownload', ({type, task, total}))
      console.log(e)
    })
    launcher.on('debug', (e) => {
      mainWindow.webContents.send('dataMc', {e})
    })
    launcher.on('data', (e) => {
      mainWindow.webContents.send('dataMcd', {e})
      console.log(e)
    })
}

async function launchGameWithMojang(ram, email, password, javaExePath, RootPath, mainWindow, event) {

  fs.unlinkSync(RootPath + 'modsList.json')

    let opts = {
        clientPackage: null,
        authorization: Authenticator.getAuth(email, password),
        root: RootPath,
        forge: RootPath + "forge.jar",
        javaPath: path.join(javaExePath + 'bin\\java.exe'),
        version: {
            number: "1.12.2",
            type: "release"
        },
        memory: {
            max: ram,
            min: "4G"
        }
    }

    launcher.launch(opts);

    launcher.on('progress', (e) => {
      let type = e.type
      let task = e.task
      let total = e.total
      event.sender.send('dataDownload', ({type, task, total}))
      console.log(e)
    })
    launcher.on('debug', (e) => {
      mainWindow.webContents.send('dataMc', {e})
    })
    launcher.on('data', (e) => {
      mainWindow.webContents.send('dataMcd', {e})
      console.log(e)
    })
}


module.exports = {launchGameWithMojang, launchGameWithMS, getRam}