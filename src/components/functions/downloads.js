const AdmZip = require("adm-zip");
const Downloader = require("nodejs-file-downloader");
const fs = require('fs')

async function downloadJava(launcherJavaPath, event) {
    const downloadJava = new Downloader({
        url: "http://193.168.146.71/java.zip",
        directory: launcherJavaPath
    })

    await downloadJava.download()

    const zip = new AdmZip(launcherJavaPath + 'java.zip')

    zip.extractAllTo(launcherJavaPath, true)

    fs.unlinkSync(launcherJavaPath + 'java.zip')

    event.sender.send('message', ('Java téléchargé avec succés'))
}

async function downloadForge(launcherPath, event) {
    const downloadForge = new Downloader({
        url: "http://193.168.146.71/forge.jar",
        directory: launcherPath
    })

    await downloadForge.download()

    event.sender.send('message', ('Forge téléchargé avec succés'))
}

async function downloadMissedMods(difference, launcherModsPath, event) {
    difference.forEach(async element => {
        const downloadMissedMods = new Downloader({
            url: "http://193.168.146.71/mods/" + element,
            directory: launcherModsPath
        })

        await downloadMissedMods.download()
    });

    event.sender.send('message', (`${difference.length} Mods manquant téléchargés avec succés`))
}

async function downloadModsList(launcherPath) {
    const downloadModsList = new Downloader({
        url: "http://193.168.146.71/modsList.json",
        directory: launcherPath, 
    });
    
    await downloadModsList.download()

    return "Liste des mods téléchargé avec succés"
}


module.exports = {downloadForge, downloadJava, downloadMissedMods, downloadModsList}