const fs = require('fs')

async function checkLauncherPaths(launcherPath, launcherModsPath, launcherJavaPath) {

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