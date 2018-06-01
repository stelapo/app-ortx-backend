import * as winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import Utils from './utils';
import Config from './config';
var expressHttpContext = require('express-http-context');

export default class Logger {
    private name: string;

    constructor(name: string, conf?: Config) {
        this.name = name;
        if (conf) {
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
    }

    formatMessage(message: string) {
        var reqId = expressHttpContext.get('reqId');
        message = this.name + " - " + (reqId ? reqId + " - " + message : message);
        return message;
    };

    debug(message: string, ...params: any[]) {
        winston.log.apply(this, ['debug', this.formatMessage(message)].concat(params));
    }

    info(message: string, ...params: any[]) {
        winston.log.apply(this, ['info', this.formatMessage(message)].concat(params));
    }

    warn(message: string, ...params: any[]) {
        winston.log.apply(this, ['warn', this.formatMessage(message)].concat(params));
    }

    error(message: string, ...params: any[]) {
        winston.log.apply(this, ['error', this.formatMessage(message)].concat(params));
    }

    write(message: string) {
        this.info(message);
    }

    /*middleware (req: Request, res: Response, next: NextFunction) {
        res.locals.wLogger = Utils.l;
        next();
    }*/
}