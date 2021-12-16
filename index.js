import fs from 'fs';
import * as readline from 'node:readline';

/*
* В параметры можно передать IP-адреса для сортировки, иначе будут использоваться заданные по умолчанию IP-адреса.
* */

const regExpIP = /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g
let inputIPs = [...process.argv].join(' ').match(regExpIP) || ['89.123.1.41','34.48.240.111'];

inputIPs = inputIPs.map(ip => {
    return {address: ip , regExp: RegExp(ip)};
});

let statistics = {};

inputIPs.forEach(ip => statistics[ip.address] = 0);

console.dir(inputIPs);

const readStream = fs.createReadStream('./logs/access.log', {
    encoding: 'utf8',
    highWaterMark: 512 * 1024
});

const readInterface = readline.createInterface({
    input: readStream
});

const writeFile = (fileName, data) => {
    fs.appendFile(`./logs/${fileName}_requests.log`, data, (err) => {
        if (err) throw err;
    });
}

readInterface.on('line', line => {
    let foundIP = inputIPs.find(ip => {
        return ip.regExp.test(line);
    })

    if(foundIP) {
        writeFile(foundIP.address, line + '\n');
        statistics[foundIP.address]++;
    }
});
readStream.on('open', () => console.log(`File reading started at ${(new Date()).toTimeString()}`));
readStream.on('end', () => {
    console.log(`File reading finished at ${(new Date()).toTimeString()}`);
    console.dir(statistics);
});
readStream.on('error', (err) => console.log(err));