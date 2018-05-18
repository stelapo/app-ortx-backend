import { Document } from 'mongoose';
import express from "express";
import * as core from "express-serve-static-core";
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import morgan from 'morgan';
import Config from './config';
import Utils from './utils';
import Logger from './logger';
import { DailyRotateFileTransportInstance } from 'winston';
import DivisionCtrl from './controllers/DivisionCtrl';
import UserModel from "./models/User";

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
        this.mountHomeRoute();
        this.mountAuthRoute();
        this.mountDivisionRoutes();
        this.preparePassport();
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
        this._express.use(bodyParser.json());
        this._express.use(bodyParser.urlencoded({ extended: false }));
        this._express.use(logErrors);
        this._express.use(clientErrorHandler);
        this._express.use(errorHandler);
        this._express.use(morgan('combined'));
    }

    private preparePassport(): void {
        passport.use('provider', new OAuth2Strategy({
            authorizationURL: this.conf.creds.authEndpoint,
            tokenURL: this.conf.creds.tokenEndpoint,
            clientID: this.conf.creds.clientID,
            clientSecret: this.conf.creds.clientSecret,
            callbackURL: this.conf.creds.callbackURL
        }, function (accessToken: string, refreshToken: string, profile: any, done: Function) {
            UserModel.findOneAndUpdate({ UserId: profile.id }, function (err: Error, user: any) {
                done(err, user);
            });
        }));

        passport.serializeUser(function (user: any, done: Function) {
            done(null, user.email);
        });

        passport.deserializeUser(function (id: string, done: Function) {
            UserModel.findById(id, function (err: Error, user: any) {
                done(err, user);
            });
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
        const router = express.Router();
        router.get("/", (req, res) => {
            this._logger.info('GET /');
            res.json({
                message: "Hello World!"
            });
        });
        this._express.use(router);
    }

    private mountAuthRoute(): void {
        this._express.get("/auth/provider", passport.authenticate('provider'));
        this._express.get('/auth/provider/callback',
            passport.authenticate('provider', {
                successRedirect: '/',
                failureRedirect: '/login'
            }));
    }

    private mountDivisionRoutes(): void {
        const divisionCtrl = new DivisionCtrl(this._logger);
        const router = express.Router();
        router.route('/divisions/count').get(divisionCtrl.count);
        router.route('/divisions').get(divisionCtrl.getAll);
        router.route('/divisions/:id').get(divisionCtrl.get);
        router.route('/divisions/:id').put(divisionCtrl.update);
        router.route('/divisions').post(divisionCtrl.insert);
        router.route('/divisions/:id').delete(divisionCtrl.delete);
        this._express.use(passport.authenticate('provider', { session: false }), router);
    }
}


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