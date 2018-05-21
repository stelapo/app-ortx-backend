import { Document } from 'mongoose';
import express from "express";
import * as core from "express-serve-static-core";
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
//import AzureOAuth2Strategy from "passport-azure-oauth2";
import morgan from 'morgan';
import Config from './config';
import Utils from './utils';
import Logger from './logger';
import { DailyRotateFileTransportInstance } from 'winston';
import DivisionCtrl from './controllers/DivisionCtrl';
import UserModel from "./models/User";
var AzureOAuth2Strategy = require("passport-azure-oauth2");
import * as jwt from 'jsonwebtoken';

//import * as path from "path";

class App {
    private _version: string = '1.0.0';
    private _express: core.Express;
    private conf: Config;
    private _logger: Logger;

    constructor(conf: Config) {
        this.conf = conf;
        this._logger = new Logger('serverLog', conf);
        this._express = express();
        this.prepare();
        this.preparePassport();
        //Routes
        this.mountHomeRoute();
        this.mountAuthRoute();
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
    /*
        // This serves everything in `static` as static files
        private prepareStatic(): void {
         this.express.use(express.static(path.join(__dirname, "/../static/")));
        }
    */
    private prepare(): void {
        this._express.use(require('express-auth-parser'));
        this._express.use(session({
            secret: 'secrettexthere',
            saveUninitialized: true,
            resave: true/*,
            // using store session on MongoDB using express-session + connect
            store: new MongoStore({
              url: config.urlMongo,
              collection: 'sessions'
            })*/
        }));
        this._express.use(bodyParser.json());
        this._express.use(bodyParser.urlencoded({ extended: false }));
        this._express.use(logErrors);
        this._express.use(clientErrorHandler);
        this._express.use(errorHandler);
        this._express.use(morgan('combined'));
    }

    private preparePassport(): void {
        passport.use('provider', new AzureOAuth2Strategy({ //new OAuth2Strategy({
            authorizationURL: this.conf.creds.authEndpoint,
            tokenURL: this.conf.creds.tokenEndpoint,
            clientID: this.conf.creds.clientID,
            clientSecret: this.conf.creds.clientSecret,
            callbackURL: this.conf.creds.callbackURL,
            resource: 'https://graph.microsoft.com'
        }, function (accessToken: string, refreshToken: string, params: any, profile: any, done: Function) {
            var user =
                jwt.decode(params.id_token, { complete: false });
            done(null, user);
            /*UserModel.findOneAndUpdate({ UserId: profile.id }, function (err: Error, user: any) {
                done(err, user);
            });*/
        }));

        passport.serializeUser(function (user: any, done: Function) {
            done(null, user.upn);
        });

        passport.deserializeUser(function (user: any, done: Function) {
            done(null, user);
            /*UserModel.findById(id, function (err: Error, user: any) {
                done(err, user);
            });*/
        });

        this._express.use(passport.initialize());
        this._express.use(passport.session());
    }

    private prepareLog(): void {
        const transp = [];
        let drt: DailyRotateFileTransportInstance;
        /* = new DailyRotateFileTransportInstance({});

        transp.push(({ 
            filename: this.conf.winstonFilename},
            timestamp: Utils.formattedTimestamp(),
            localTime: true,
            datePattern: 'yyyy-MM-dd',
            prepend: true,
            zippedArchive: true,
            maxDays: 7,
            json: true,
            level: app.get('env') === 'development' ? 'debug' : 'info'
          }));*/
    }

    /*
        // Sets up handlebars as a view engine
        private setViewEngine(): void {
          this.express.set("view engine", "hbs");
          this.express.set("views", path.join(__dirname, "/../src/views"));
        }
    */
    // Prepare the / route to show a hello world page
    private mountHomeRoute(): void {
        this._express.get("/home", (req, res) => {
            this._logger.info('GET /');
            res.json({
                message: "Hello World!"
            });
        });
    }

    private authCallback() {

    }

    private mountAuthRoute(): void {
        this._express.get("/auth/provider", passport.authenticate('provider'/*, { session: false }*/));
        this._express.get('/auth/provider/callback',
            passport.authenticate('provider', {
                successRedirect: '/api/divisions/count',
                failureRedirect: '/login'
            }));
    }

    private mountApiRoutes(): void {
        const divisionCtrl = new DivisionCtrl(this._logger);
        const router = express.Router();
        //router.route('/api/divisions/count').get(divisionCtrl.count);
        this._express.get("/api/divisions/count", isAuthenticated, (req, res) => {
            this._logger.info('GET /api/divisions/count');
            divisionCtrl.count(req, res);
        });
        router.route('/api/divisions').get(divisionCtrl.getAll);
        router.route('/api/divisions/:id').get(divisionCtrl.get);
        router.route('/api/divisions/:id').put(divisionCtrl.update);
        router.route('/api/divisions').post(divisionCtrl.insert);
        router.route('/api/divisions/:id').delete(divisionCtrl.delete);
        this._express.use(/*isAuthenticated,*/ router);
    }
}

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(403).json({ message: 'Forbidden' });
};


function logErrors(err: Error, req: Request, res: Response, next: Function) {
    console.error(err.stack)
    next(err)
}

function clientErrorHandler(err: Error, req: Request, res: Response, next: Function) {
    if (req.xhr) {
        res.status(500).send({ error: 'Something failed!' })
    } else {
        next(err)
    }
}

function errorHandler(err: Error, req: Request, res: Response, next: Function) {
    res.status(500)
    res.render('error', { error: err })
}


export default App;