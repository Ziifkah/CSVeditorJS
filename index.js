// On utilise express pour créer un serveur. body-parser pour parse le body des requests et nodemon pour être sur que le serveur restart quand il y a du chagements dans les fichiers.
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

// Le create endpoint

const fs = require('fs')
const stringify = require('csv-stringify').stringify

// Le read endpoint

const parse = require('csv-parse').parse
const os = require('os')
const multer = require('multer')
const upload = multer({ dest: os.tmpdir() })

// Initialisation du serveur
app.use(bodyParser.json())
app.use(express.static('public'))

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

// Validation des datas envoyées, stringify fonction pour créer le string CSV. La fonction prend les datas pour les string en premier parametre, en objet d'option en second et en 3ème une fonction callback.
// Option header pour assurer les noms de colones en header du csv
// Fonction callback on créer un fichier fs dans le dossier files en utilisant writeFile. Le fichier va contenir le strong du csv en utilisant stringify. Dans la fonction writeFile on retourne le csv pour donwload.
app.post('/create', (req, res) => {
    const data = req.body.data

    if (!data || !data.length) {
        return res.status(400).json({ success: false, message: 'Please enter at least 1 row' })
    }

    stringify(data, {
        header: true
    }, function(err, str) {
        const path = './files/' + Date.now() + '.csv'
            // Creation du dossier files s'il n'exsiste pas
        if (!fs.existsSync('./files')) {
            fs.mkdirSync('./files')
        }
        fs.writeFile(path, str, function(err) {
            if (err) {
                console.error(err)
                return res.status(400).json({ success: false, message: 'An error occurred' })
            }

            res.download(path, 'file.csv')
        })
    })
})

// Le read endpoint

app.post('/read', upload.single('file'), (req, res) => {
    const file = req.file

    const data = fs.readFileSync(file.path)
    parse(data, (err, records) => {
        if (err) {
            console.error(err)
            return res.status(400).json({ success: false, message: 'An error occurred' })
        }

        return res.json({ data: records })
    })
})