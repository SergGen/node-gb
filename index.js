import fs from 'fs';
import * as readline from 'node:readline';

/*
* В параметры можно передать IP-адреса для сортировки, иначе будут использоваться заданные по умолчанию IP-адреса.
* */

const regExpIP = /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g
let inputIPs = [...process.argv].join(' ').match(regExpIP) || ['89.123.1.41','34.48.240.111'];
const readStream = fs.createReadStream('./logs/test.log', 'utf8');
const readInterface = readline.createInterface({input: readStream});

inputIPs = inputIPs.map(ip => {
    return {address: ip , regExp: RegExp(ip), writeStream: null, statistics: 0};
});

console.dir(inputIPs);

readInterface.on('line', line => {
    let foundIP = inputIPs.find(ip => {
        return ip.regExp.test(line);
    });
    if(foundIP) {
        if(!foundIP.writeStream) {
            foundIP.writeStream = fs.createWriteStream(`./logs/${foundIP.address}_requests.log`,
                {flags: 'a', autoClose: true});
        }
        foundIP.writeStream.write(line + '\n');
        foundIP.statistics++;
    }
});

console.dir(readStream);

readStream.on('open', () => console.log(`File reading started at ${(new Date()).toTimeString()}`));
readStream.on('end', () => {
    console.log(`File reading finished at ${(new Date()).toTimeString()}`);
    inputIPs.forEach(ip => console.log(ip.address, '\t', ip.statistics));
});
readStream.on('error', (err) => console.log(err));