import * as padWinston from 'winston';
import { Request, Response, NextFunction } from 'express';
import Utils from './utils';
import Logger from './logger';
var expressHttpContext = require('express-http-context');

export default class PADLogger extends Logger {

    constructor(name: string) {
        super(name);
    }

    info(message: string, ...params: any[]) {
        if (Utils.c.padLogLevel === 'info') {
            padWinston.log.apply(this, ['info', this.formatMessage(message)].concat(params));
        }
    }

    levels(m: string) { };
}