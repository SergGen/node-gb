'use strict';
const path = require("path");
const http = require('http');
const fs = require("fs");
const {URL} = require('url');

let currentDirectory = path.resolve(process.cwd());

const server = http.createServer((request, response) => {
    let baseURL = 'http://' + request.headers.host + '/';
    let currentURL = new URL(request.url, baseURL);
    let selectedElemAddress = '';

    if (request.method === 'GET') {
        if(request.url !== '/') {
            selectedElemAddress = path.resolve(currentURL.searchParams.get('path'));
        }
        else {
            currentDirectory = path.resolve(process.cwd());
            selectedElemAddress = currentDirectory;
        }

        fs.stat(selectedElemAddress, (err, stats) => {
            if(err) {
                let errAddress = selectedElemAddress;
                currentDirectory = path.resolve(process.cwd());
                selectedElemAddress = currentDirectory;
                send(response, baseURL, '', errAddress);
            } else {
                if(stats.isDirectory()) {
                    currentDirectory = selectedElemAddress;
                    send(response, baseURL);
                }
                if(stats.isFile()) {
                    fs.readFile(selectedElemAddress, 'utf8', (err, data) => {
                        if (err){
                            throw err;
                        }
                        send(response, baseURL, data);
                    });
                }
            }
        });
    } else {
        response.end('Method Not Allowed');
    }
});
server.listen(3000, 'localhost');

const dirParser = (currentDirectory) => {
    try {
        fs.accessSync(currentDirectory, fs.constants.F_OK | fs.constants.R_OK);
        return fs.readdirSync(currentDirectory, {withFileTypes: true});
    } catch (err) {
        console.log('\nNo access! Try again\n');
    }
}

const send = (response, baseURL, data = '', err = '') => {
    let listLi='';
    let answer = '';
    let listNames = [];
    let fileData = '';
    let header = `<h3>Current address: ${currentDirectory}</h3>`;
    let dirUp = `<li><a href="${`${baseURL}?path=` + path.resolve(currentDirectory + '\\' + '..') }">..</a></li>`;
    let errMarkup = '';

    if(err) {
        errMarkup = `<h3>Incorrect address: ${err}</h3>`;
    }

    const htmlPageBegin = '<!doctype html><html lang="en"><head>' +
        '<meta charset="UTF-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
        '<link rel="shortcut icon" href="data:image/x-icon" type="image/x-icon">'+
        '<title>Directories</title></head><body>';

    const htmlPageEnd = '</body></html>';

    if(data) {
        fileData = `<p>${data.replace(/\n/g,'<br>')}</p>`;
    }

    listNames = dirParser(currentDirectory);
    listNames.forEach(name => {
        let decorName = name.isDirectory() ? `&#128194; ${name.name}` : name.name;
        listLi += `<li><a href="${`${baseURL}?path=` + currentDirectory + '\\' + name.name}">${decorName}</a></li>`;
    });

    answer = htmlPageBegin + errMarkup + header + '<ul>' + dirUp + listLi + '</ul>' + fileData + htmlPageEnd;
    response.writeHead(200, 'OK',{ 'Content-Type': 'text/html'});
    response.write(answer);
    response.end();
}