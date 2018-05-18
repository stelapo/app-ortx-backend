import * as winston from 'winston';
import Utils from './utils';
import Config from './config';
//winston.transports.DailyRotateFile = require('winston-daily-rotate-file');

export default class Logger {
    private name: string;

    constructor(name: string, conf: Config) {
        this.name = name;                
        winston.remove(winston.transports.Console);
        if (conf.consoleOutput) {
            winston.add(winston.transports.Console, { level: conf.logLevel, timestamp: Utils.formattedTimestamp });
        }
        winston.add(require('winston-daily-rotate-file'), {
            filename: conf.winstonFilename,
            datePattern: 'YYYYMMDD',
            level: conf.logLevel,
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