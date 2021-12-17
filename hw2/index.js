// const colors = require("colors");
import colors from "colors";
// const EventEmitter = require('events');
import {EventEmitter} from 'events';

/*
* Для запуска таймеров указываете параметры времени в следующем формате ГГГГ-ММ-ДД-ЧЧ-ММ-СС
* */

let inputParams = [...process.argv];
let workParams = [];
let timersBlock = [];
const emitterObject = new EventEmitter();

inputParams.splice(0,2);

if(inputParams.length === 0){
    throw new Error('Не переданы входные параметры'.red);
}

inputParams = inputParams.map(param => param.split('-'));

workParams = inputParams.map((param, i) => {
    let periodBlock = {};

    if(param.length !== 6) {
        throw new Error(`Ошибка в переданном параметре ${i + 1}`.red);
    }

    param.forEach((periodValue, j) => {
        let periodName = '';
        if(j === 0){periodName = 'years'}
        if(j === 1){periodName = 'months'}
        if(j === 2){periodName = 'days'}
        if(j === 3){periodName = 'hours'}
        if(j === 4){periodName = 'minutes'}
        if(j === 5){periodName = 'seconds'}
        if(isNaN(Number(periodValue)) || Number(periodValue) < 0) {
            throw new Error(`Ошибка в переданном параметре ${i + 1} в элементе ${periodName}`.red);
        }
        periodBlock[periodName] = Number(periodValue);
    });
    return periodBlock;
})

console.dir(workParams);

class Timers {
    timerId
    constructor(timestamp, paramId, emitterObject) {
        this.paramId = paramId;
        this.emitterObject = emitterObject;
        this.timestamp = timestamp - Date.now();
        this.setTimer();
    }
    decreaseTime = () => {
        if(this.timestamp > 0){
            this.showCurrentTime();
            this.timestamp -= 1000;
        } else {
            this.stopTimer();
            console.log('Таймер остановлен');
        }
    }
    makeTick = () => {
        this.emitterObject.emit(`start${this.paramId}`)
    }
    showCurrentTime() {
        if(this.timerId % 2 === 0){
            console.log(colors.yellow(this.timestamp));
        } else {
            console.log(colors.green(this.timestamp));
        }

    }
    setTimer() {
        this.timerId = setInterval(this.makeTick, 1000);
        this.emitterObject.on(`start${this.paramId}`, this.decreaseTime);
    }
    stopTimer() {
        clearInterval(this.timerId);
        this.emitterObject.removeListener(`start${this.paramId}`, this.decreaseTime);
    }
}

workParams.forEach(({years, months, days, hours, minutes, seconds}, index) => {
    timersBlock.push(new Timers(Number(new Date(years, months - 1, days, hours, minutes, seconds)),
        index, emitterObject));
});