import { Document } from 'mongoose';
import express from "express";
import * as core from "express-serve-static-core";
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectmongo from 'connect-mongo';
import bodyParser from 'body-parser';
import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import morgan from 'morgan';
import Config from './config';
import Utils from './utils';
import Logger from './logger';
import PADLogger from './padLogger';
import { DailyRotateFileTransportInstance } from 'winston';
import UserModel from "./models/User";
import * as jwt from 'jsonwebtoken';
import BaseCtrl from "./controllers/BaseCtrl";
import DivisionCtrl from './controllers/DivisionCtrl';
import CustomerCtrl from './controllers/CustomerCtrl';
import OfferCtrl from './controllers/OfferCtrl';
import OfferStateCtrl from './controllers/OfferStateCtrl';
import sqlite3, { RunResult, Statement } from 'sqlite3';
import uuid from 'node-uuid';
var expressHttpContext = require('express-http-context');

class App {
    private _version: string = '1.0.0';
    private _express: core.Express;
    private _conf: Config;
    private _logger: Logger;
    private _morganL: express.RequestHandler;
    private sqliteDb: sqlite3.Database;

    constructor(conf: Config, sqliteDb: sqlite3.Database) {
        this._conf = conf;
        this.sqliteDb = sqliteDb;
        this._logger = new Logger('serverLog', conf);
        this._morganL = morgan(this.conf.morganFormat, { stream: this._logger });
        this._express = express();
        this.prepare();
        this.preparePassport();
        //Routes
        this.mountHomeRoute();
        this.mountApiRoutes();

        this._logger.info('App is starting.');
        this._logger.info('Version ' + this._version);
        /*this.prepareStatic();
        this.setViewEngine();*/
    }

    get express(): core.Express {
        return this._express;
    }

    get logger(): Logger {
        return this._logger;
    }

    get conf(): Config {
        return this._conf;
    }
    /*
        // This serves everything in `static` as static files
        private prepareStatic(): void {
         this.express.use(express.static(path.join(__dirname, "/../static/")));
        }
    */
    private prepare(): void {
        //this._express.use(this._logger.middleware);
        this._express.use(expressHttpContext.middleware);
        this._express.use(this._morganL); //registro il logger Morgan sul logger Winston
        /* NON CANCELLARE
        this._express.use(require('express-auth-parser'));
        let MongoStore = connectmongo(session);
        this._express.use(session({
            secret: 'eF440Hjk1_&8',
            saveUninitialized: false,
            resave: false,
            cookie: {
                maxAge: 1000 * 30 //30 secondi
            },
            // using store session on MongoDB using express-session + connect
            store: new MongoStore({
                url: this.conf.mongoUrl,
                collection: 'sessions'
            })
        }));*/
        this._express.use(bodyParser.json());
        this._express.use(bodyParser.urlencoded({ extended: false }));
        this._express.use(this.logErrors);
        this._express.use(this.clientErrorHandler);
        this._express.use(this.errorHandler);

        //Add functions middleware
        this._express.use(function (req, res, next) {
            Utils.l.debug('uuid=' + uuid.v1());
            expressHttpContext.set('reqId', uuid.v1());
            next();
        });

        this._express.use(function (req, res, next) {
            Utils.l.debug("HEADERS= " + JSON.stringify(req.headers));

            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            // intercept OPTIONS method
            if ('OPTIONS' == req.method) {
                res.sendStatus(200);
            }
            else {
                next();
            }
        });
    }

    private preparePassport(): void {
        this._express.use(passport.initialize());
        this._express.use(passport.session());

        var options = {
            identityMetadata: this.conf.oAuthData.identityMetadata,
            clientID: this.conf.oAuthData.clientID,
            validateIssuer: this.conf.oAuthData.validateIssuer,
            // issuer: config.creds.issuer,
            passReqToCallback: this.conf.oAuthData.passReqToCallback,
            isB2C: this.conf.oAuthData.isB2C,
            // policyName: config.creds.policyName,
            // allowMultiAudiencesInToken: config.creds.allowMultiAudiencesInToken,
            audience: this.conf.oAuthData.audience,
            loggingLevel: this.conf.oAuthData.loggingLevel,
            loggingNoPII: this.conf.oAuthData.loggingNoPII
            // clockSkew: config.creds.clockSkew,
            // scope: config.creds.scope
        };
        var Logging = require('passport-azure-ad/lib/logging');
        Logging.getLogger = PADLogger;
        var OIDCBearerStrategy = require('passport-azure-ad').BearerStrategy;
        var bearerStrategy = new OIDCBearerStrategy(options,
            function (req: any, token: any, done: any) {
                Utils.l.info(JSON.stringify(token), 'was the token retreived');
                if (!token.oid)
                    done(new Error('oid is not found in token'));
                else {
                    let owner = token.oid;
                    done(null, token);
                }
            }
        );
        passport.use(bearerStrategy);
    }

    // Prepare the / route to show a hello world page
    private mountHomeRoute(): void {
        this._express.get("/home", (req, res) => {
            res.json({
                message: "Hello World!"
            });
        });

        /*this._express.get('/sqlite2', (req, res) => {
            let num = Utils.getNextOfferNum(this.conf.sqliteFile, this._logger);
            this._logger.debug("????? num = " + num);
            num.then(
                (n) => { res.status(200).json(n); },
                (e) => { res.status(500).json(e); }
            );
        });*/
    }

    private mountApiRoutes(): void {
        //Divisions
        const divisionCtrl = new DivisionCtrl();
        this.mountApiRoutesFromCtrl(divisionCtrl, '/divisions');
        //Customers
        const customerCtrl = new CustomerCtrl();
        this.mountApiRoutesFromCtrl(customerCtrl, '/customers');
        //Offers
        const offerCtrl = new OfferCtrl();
        this.mountApiRoutesFromCtrl(offerCtrl, '/offers');
        //OfferStates
        const offerStateCtrl = new OfferStateCtrl();
        this.mountApiRoutesFromCtrl(offerStateCtrl, '/offerStates');
    }

    private mountApiRoutesFromCtrl(ctrl: BaseCtrl, path: string) {
        const router = express.Router();
        //router.use(passport.authenticate('oauth-bearer', { session: false }));
        router.route('/count').get(ctrl.count);
        router.route('/').get(ctrl.getAll);
        router.route('/').post(ctrl.insert);
        router.route('/:id').get(ctrl.get);
        router.route('/:id').put(ctrl.update);
        router.route('/:id').delete(ctrl.delete);
        this._express.use(path, router);
    }

    private logErrors(err: Error, req: Request, res: Response, next: Function) {
        console.error(err.stack)
        next(err)
    }

    private clientErrorHandler(err: Error, req: Request, res: Response, next: Function) {
        if (req.xhr) {
            this._logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            res.status(500).send({ error: 'Something failed!' })
        } else {
            next(err)
        }
    }

    private errorHandler(err: Error, req: Request, res: Response, next: Function) {
        this._logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500)
        res.render('error', { error: err })
    }

}
export default App;