#!C:\Program Files\nodejs\node.exe

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const colors = require("colors");
const { Transform } = require('stream');

let currentFile = '';
let currentDirectory = '';
let listNames = [];
let regExp = null;

/**
 * Проверяет существование выбранной дирректории и формирует список файлов и папок в ней
 */
const dirParser = () => {
    try {
        fs.accessSync(currentDirectory, fs.constants.F_OK | fs.constants.R_OK);
        console.log(currentDirectory);
        listNames = fs.readdirSync(currentDirectory, {withFileTypes: true}).map(file => {
            return file.isFile() ? `(F) ${file.name}` : `(D) ${file.name}`
        });
        listNames = ['..', ...listNames];
    } catch (err) {
        console.log('\nNo access! Try again\n');
        pathChecker();
    }
}

/**
 * Обрабатывает ручной ввод текущей директории.
 * Если ничего не ввести, то используется директория запуска скрипта.
 */
const pathChecker = () => {
    inquirer
    .prompt([
        {
            name: "dirName",
            type: "input",
            message: colors.green("Enter path or leave empty:"),
        }
    ])
    .then((answer) => {
        currentDirectory = path.resolve(answer.dirName.trim() ? answer.dirName : process.cwd());
        dirParser();
        dirSerf();
    });
}

/**
 * Обрабатывается навигация по папкам
 */
const dirSerf = () => {
    inquirer
        .prompt([
            {
                name: 'dirElem',
                type: "list",
                message: colors.green("Choose file: "),
                choices: listNames
            }
        ])
        .then((answer) => {
            if(answer.dirElem === '..') {
                currentDirectory = path.resolve(currentDirectory, answer.dirElem);
                dirParser();
                dirSerf();
            }
            if(answer.dirElem[1] === 'D') {
                currentDirectory = path.resolve(currentDirectory, answer.dirElem.substr(4, answer.dirElem.length));
                dirParser();
                dirSerf();
            }
            if(answer.dirElem[1] === 'F') {
                currentFile = path.resolve(currentDirectory, answer.dirElem.substr(4, answer.dirElem.length));
                setRegExp();
            }
        });
}

/**
 * Обработка подсветки найденного текста
 * @type {module:stream.internal.Transform}
 */
const transformStream = new Transform({
    transform(chunk, encoding, callback) {
        if(regExp) {
            let matchWord = chunk.toString().match(regExp)?.[0];

            if(matchWord) {
                const transformedChunk = chunk.toString().replace(regExp, colors.bgYellow(matchWord));
                this.push(transformedChunk);

            } else {
                this.push(chunk);
            }
        } else {
            this.push(chunk);
        }
        callback();
    }
});

/**
 * Запускается поток для чтения отображаемого файла
 */
const showFile = () => {
    const readStream = new fs.createReadStream(currentFile, 'utf8');
    readStream.pipe(transformStream).pipe(process.stdout);
}

/**
 * Обрабатывается установка регулярного выражения для подсветки искомого текста
 */
const setRegExp = () => {
    inquirer
        .prompt([
            {
                name: 'pattern',
                type: 'input',
                message: colors.green('Enter pattern or leave empty: ')
            },
            {
                name: 'flags',
                type: 'checkbox',
                message: colors.green('Enter flags or leave empty: '),
                choices: ['i', 'g', 'm', 's', 'u', 'y']
            }
        ])
        .then((answer) => {
            if(answer.pattern) {
                regExp = new RegExp(answer.pattern, answer.flags.join(''));
                showFile();
            } else {
                showFile();
            }
        });
}

pathChecker();