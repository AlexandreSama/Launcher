const fs = require('fs')
const { downloadJava, downloadForge, downloadMissedMods } = require('./downloads')

async function checkLauncherPaths(launcherPath, launcherModsPath, launcherJavaPath, event) {

    if (fs.existsSync(launcherPath)) {

        if (fs.existsSync(launcherJavaPath)) {

            if (fs.existsSync(launcherModsPath)) {

                return true

            } else {

                fs.mkdirSync(launcherModsPath)

                return "Dossier crée avec succés"

            }
        } else {

            fs.mkdirSync(launcherJavaPath)

            if (fs.existsSync(launcherModsPath)) {

                return true

            } else {

                fs.mkdirSync(launcherModsPath)

                return "Dossier crée avec succés"

            }

        }
    } else {

        fs.mkdirSync(launcherPath)

        if (fs.existsSync(launcherJavaPath)) {

            if (fs.existsSync(launcherModsPath)) {

                return true

            } else {

                fs.mkdirSync(launcherModsPath)

                return "Dossier crée avec succés"
            }

        } else {

            fs.mkdirSync(launcherJavaPath)

            if (fs.existsSync(launcherModsPath)) {

                return true

            } else {

                fs.mkdirSync(launcherModsPath)

                return "Dossier crée avec succés"

            }

        }
    }
}

async function checkForge(launcherPath, event) {

    fs.readFile(launcherPath + 'forge.jar', async (err, file) => {
        if(err){
            const result = await downloadForge(launcherPath, event)
            if(result){
                return true
            }
        }
    })
}

async function checkJava(launcherJavaPath, event) {
    const files = fs.readdirSync(launcherJavaPath)
    if(files.length == 0){
        const result = await downloadJava(launcherJavaPath, event)
        if(result){
            return true
        }
    }
}

async function checkMods(launcherPath, launcherModsPath, event) {

    let jsonMods = []
    let folderMods = []

    fs.readdirSync(launcherModsPath).forEach(file => {
        folderMods.push(file)
    })

    let modsData = fs.readFileSync(launcherPath + "modsList.json")
    let jsonData = JSON.parse(modsData)

    await jsonData.forEach(element => {
      jsonMods.push(element.name)
    });

    let difference = jsonMods.filter(x => !folderMods.includes(x));
    
    if(difference.length >= 1){
      downloadMissedMods(difference, launcherModsPath, event)
    }
}

module.exports = {checkLauncherPaths, checkForge, checkJava, checkMods}