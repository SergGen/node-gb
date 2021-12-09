const colors = require("colors");

function numberCheck(paramType, param){
    if(param === undefined){
        throw new Error(`${paramType} parameter is not set`);
    }
    if(isNaN(Number(param))){
        throw new Error(`${paramType} parameter is not Number type`);
    }
}

numberCheck('Start', process.argv[2]);
numberCheck('End', process.argv[3]);

const startEl = Number(process.argv[2] <= process.argv[3] ? process.argv[2] : process.argv[3]);
const endEl = Number(process.argv[2] >= process.argv[3] ? process.argv[2] : process.argv[3]);
let primeNumbers = [];
let primeNumCheck = true;
const GREEN = 'green';
const YELLOW = 'yellow';
const RED = 'red';
let chooseColor = GREEN;

for(let i = startEl; i <= endEl; i++){
    primeNumCheck = true;
    for(let j = 2; j <= Math.sqrt(i); j++){
        if(i % j === 0){
            primeNumCheck = false;
            break;
        }
    }
    if(primeNumCheck){
        primeNumbers.push(i);
    }
}

let outputData = primeNumbers.map((num) => {
    if(chooseColor === GREEN){
        chooseColor = YELLOW;
        return String(num).green;
    }
    if(chooseColor === YELLOW){
        chooseColor = RED;
        return String(num).yellow;
    }
    if(chooseColor === RED){
        chooseColor = GREEN;
        return String(num).red;
    }
});

if(primeNumbers.length !== 0) {
    console.log(outputData.join(' '));
} else {
    console.log('Prime numbers not found'.red);
}