const { name } = require('ejs');
const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.static('public'));

let chosenCharacter;
let characterOfTheDay;

const charactersPath = path.join(__dirname, 'public/characters.json');
app.set('views', __dirname + 'views');
app.set("view engine", "ejs")


app.get('/', (req, res) => {
    fs.readFile(charactersPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while reading the file.');
        }

        let characters = JSON.parse(data);
        characterOfTheDay = characters[Object.keys(characters)[Math.floor(Math.random() * Object.keys(characters).length)]];
        characters = {};
        console.log(characterOfTheDay);
        res.render('index', { characters, chosenCharacter, characterOfTheDay });
    });
});

app.use('/images', express.static(path.join(__dirname, 'images')));


app.get('/search', (req, res) => {
    fs.readFile(charactersPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while reading the file.');
        }

        const characters = JSON.parse(data);
        const query = req.query.query.toLowerCase();
        const filteredCharacters = {};
        for (let character in characters) {
            for (let name of characters[character].names) {
                if (name.toLowerCase().includes(query)) {
                    filteredCharacters[character] = characters[character];
                }
            }
        }

        res.json(filteredCharacters);
    });
});

function getCharacterData(name) {
    const characters = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));
    return characters[name];
}

app.get('/character', (req, res) => {
    const characterName = req.query.foundCharacterName;
    const characterData = getCharacterData(characterName);
    if (characterData) {
        res.json(characterData);
    } else {
        res.status(404).json({ success: false, error: 'Character not found' });
    }
});

app.get('/chooseCharacter', (req, res) => {
    const chosenCharacterName = req.query.foundCharacterName;
    const characterData = getCharacterData(chosenCharacterName);
    if (characterData) {
        chosenCharacter = characterData;
        res.json({ success: true, chosenCharacter });
    } else {
        chodenCharacter = null;
        res.status(404).json({ success: false, error: 'Character not found' });
    }
});

app.get('/comparison', (req, res) => {
    fs.readFile(charactersPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while reading the file.');
        }

        const characters = JSON.parse(data);
        let b = true;

        const comparison = {};

        for (let property in chosenCharacter) {
            if (property === 'imageFile' || property === 'names') continue;
            if (typeof chosenCharacter[property] == 'object' && chosenCharacter[property] !== null && chosenCharacter[property].constructor === Array) {
                for (let el of chosenCharacter[property]) {
                    if (characterOfTheDay[property].includes(el)) {
                        if (comparison[property] === "false" || comparison[property] === "close") {
                            comparison[property] = "close";
                            b = false;
                            break;
                        }
                        comparison[property] = "true";
                    } else {
                        if (comparison[property] === "true" || comparison[property] === "close") {
                            comparison[property] = "close";
                            b = false;
                            break;
                        } else {
                            comparison[property] = "false";
                            b = false;
                        }
                    }
                }
                if (characterOfTheDay[property].length > chosenCharacter[property].length && comparison[property] == "true") {
                    comparison[property] = "close";
                }
                continue;
            }
            if (property === "age") {
                comparison[property] = ""
                if (chosenCharacter[property] > characterOfTheDay[property]) {
                    comparison[property] += "down";
                }
                if (chosenCharacter[property] < characterOfTheDay[property]) {
                    comparison[property] += "up"
                }
                if (chosenCharacter[property] == characterOfTheDay[property]) {
                    comparison[property] += " true";
                } else if (chosenCharacter[property] >= characterOfTheDay[property] - 5 && chosenCharacter[property] <= characterOfTheDay[property] + 5) {
                    comparison[property] += " close";
                } else {
                    comparison[property] += " false";
                    b = false;
                }
                continue;

            }
            if (chosenCharacter[property] === characterOfTheDay[property]) {
                comparison[property] = "true";
            } else {
                comparison[property] = "false";
                b = false;
            }
        }
        res.json(comparison);
    });
});

app.listen(3000, () => console.log('Server is running on port 3000'));

