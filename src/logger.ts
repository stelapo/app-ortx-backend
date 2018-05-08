import * as winston from 'winston';
import Utils from './utils';
//winston.transports.DailyRotateFile = require('winston-daily-rotate-file');

export default class Logger {
    private name: string;

    constructor(name: string, filename: string) {
        this.name = name;
        //winston.setLevels('debug');
        //winston.add(winston.transports.Console);
        console.log(Utils.formattedTimestamp());
        winston.add(require('winston-daily-rotate-file'), {
            filename: filename,
            datePattern: 'YYYYMMDD',
            level: 'debug',
            timestamp: Utils.formattedTimestamp,
            //localTime: true,
            //prepend: true,
            zippedArchive: true,
            maxFiles: 7
        });
    }

    debug(format: string, ...params: any[]) {
        winston.log.apply(this, ['debug', this.name + ' - ' + format].concat(params));
    }

    info(format: string, ...params: any[]) {
        winston.log.apply(this, ['info', this.name + ' - ' + format].concat(params));
    }

    warn(format: string, ...params: any[]) {
        winston.log.apply(this, ['warn', this.name + ' - ' + format].concat(params));
    }

    error(format: string, ...params: any[]) {
        winston.log.apply(this, ['error', this.name + ' - ' + format].concat(params));
    }
}