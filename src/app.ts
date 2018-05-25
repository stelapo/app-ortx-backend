import { Document } from 'mongoose';
import express from "express";
import * as core from "express-serve-static-core";
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectmongo from 'connect-mongo';
import bodyParser from 'body-parser';
import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
//import AzureOAuth2Strategy from "passport-azure-oauth2";
import morgan from 'morgan';
import Config from './config';
import Utils from './utils';
import Logger from './logger';
import { DailyRotateFileTransportInstance } from 'winston';
import UserModel from "./models/User";
var AzureOAuth2Strategy = require("passport-azure-oauth2");
import * as jwt from 'jsonwebtoken';
import BaseCtrl from "./controllers/BaseCtrl";
import DivisionCtrl from './controllers/DivisionCtrl';
import CustomerCtrl from './controllers/CustomerCtrl';
import OfferCtrl from './controllers/OfferCtrl';
import sqlite3, { RunResult, Statement } from 'sqlite3';

//import * as path from "path";

class App {
    private _version: string = '1.0.0';
    private _express: core.Express;
    private _conf: Config;
    private _logger: Logger;
    private sqliteDb: sqlite3.Database;

    constructor(conf: Config, sqliteDb: sqlite3.Database) {
        this._conf = conf;
        this.sqliteDb = sqliteDb;
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
        this._express.use(morgan(this.conf.morganFormat, { stream: this.logger })); //registro il logger Morgan sul logger Winston
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
        }));
        this._express.use(bodyParser.json());
        this._express.use(bodyParser.urlencoded({ extended: false }));
        this._express.use(this.logErrors);
        this._express.use(this.clientErrorHandler);
        this._express.use(this.errorHandler);
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
            done(null, user);
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
            res.json({
                message: "Hello World!"
            });
        });
        this._express.get("/loggedin", this.isAuthenticated, (req, res) => {
            res.sendStatus(200);
        });

        this._express.get('/sqlite2', (req, res) => {
            let num = Utils.getNextOfferNum(this.conf.sqliteFile, this._logger);
            this._logger.debug("????? num = " + num);
            num.then(
                (n) => { res.status(200).json(n); },
                (e) => { res.status(500).json(e); }
            );
        });

        /*this._express.get('/sqlite/:id', (req, res) => {
            let nextVal: number = -1;
            //const db = await this.sqlitedbPromise;
            //const [post, categories, chiavi, max] = await Promise.all([
            //    db.get('SELECT * FROM Post WHERE id = ?', req.params.id),
            //    db.all('SELECT * FROM Category'),
            //    db.all('SELECT c.*, strftime(\'%Y\',\'now\') ora FROM Chiavi c'),
            //    db.all('SELECT max(num)+1 next FROM Chiavi c where tipo = \'offers\' and anno=strftime(\'%Y\',\'now\')')
            //]);
            try {
                const db = this.sqliteDb;
                console.log('serialize');
                db.serialize(function () {
                    console.log('BEGIN');
                    db.exec("BEGIN");
                    console.log('before ins');
                    db.run("INSERT OR IGNORE INTO Chiavis(tipo, anno, num) VALUES ('offers', strftime('%Y','now'), 0)", [],
                        (result: RunResult, err: Error) => {
                            console.log("after insert");
                            if (err) {
                                console.log(err);
                                return res.status(500).json(err);
                            }
                            if (result)
                                console.log("after insert changes = " + result.changes);
                        });
                    console.log('before update');
                    db.run("UPDATE Chiavis SET num = num + 1 WHERE tipo = 'offers' and anno = strftime('%Y','now')", [],
                        (result: RunResult, err: Error) => {
                            console.log("after update");
                            if (err) {
                                console.log(err);
                                return res.status(500).json(err);
                            }
                            if (result)
                                console.log("after update changes = " + result.changes);
                        });
                    console.log('select');
                    db.get("SELECT num FROM Chiavi c where tipo = 'offers' and anno=strftime('%Y','now')",
                        (err: Error, row: any) => {
                            console.log("after select");
                            if (err) {
                                console.log(err);
                                return res.status(500).json(err);
                            }
                            if (row) {
                                console.log("DATA FOUND=" + row.num);
                                nextVal = row.num;
                            } else {
                                return res.status(500).json("NO DATA FOUND");
                            }
                            res.status(200).json({ r: nextVal });
                        });
                    db.exec("COMMIT");
                });

                //res.render('post', { post, categories });
                //res.send({ post, categories, chiavi, max });

            } catch (err) {
                res.status(500).json(err);
            }
        });*/
    }

    private mountAuthRoute(): void {
        this._express.get("/login", passport.authenticate('provider'/*, { session: false }*/));
        this._express.get("/auth/provider", passport.authenticate('provider'/*, { session: false }*/));

        this._express.get("/logout", function (req, res) {
            req.logout();
            res.sendStatus(200);
        });

        this._express.get('/auth/provider/callback',
            (req, res, next) => {
                passport.authenticate('provider', function (err, user, info) {
                    if (err) { return next(err); }
                    if (!user) { return res.redirect('/login'); }
                    req.logIn(user, function (err) {
                        if (err) { return next(err); }
                        return res.redirect('/loggedin?u=' + user.upn);
                    });
                })(req, res, next);
            }

            /*passport.authenticate('provider', {
                //session: false,
                successRedirect: '/loggedin',
                failureRedirect: '/login'
            })*/
        );
    }

    private mountApiRoutes(): void {
        //Division
        const divisionCtrl = new DivisionCtrl(this._logger);
        /*const router = express.Router();
        router.use(this.isAuthenticated);
        router.route('/count').get(divisionCtrl.count);
        router.route('/').get(divisionCtrl.getAll);
        router.route('/').post(divisionCtrl.insert);
        router.route('/:id').get(divisionCtrl.get);
        router.route('/:id').put(divisionCtrl.update);
        router.route('/:id').delete(divisionCtrl.delete);
        this._express.use('/divisions', router);*/
        this.mountApiRoutesFromCtrl(divisionCtrl, '/divisions');
        //
        const customerCtrl = new CustomerCtrl(this._logger);
        this.mountApiRoutesFromCtrl(customerCtrl, '/customers');
        //
        const offerCtrl = new OfferCtrl(this._logger);
        this.mountApiRoutesFromCtrl(offerCtrl, '/offers');
    }

    private mountApiRoutesFromCtrl(ctrl: BaseCtrl, path: string) {
        const router = express.Router();
        //router.use(this.isAuthenticated);
        router.route('/count').get(ctrl.count);
        router.route('/').get(ctrl.getAll);
        router.route('/').post(ctrl.insert);
        router.route('/:id').get(ctrl.get);
        router.route('/:id').put(ctrl.update);
        router.route('/:id').delete(ctrl.delete);
        this._express.use(path, router);
    }


    private isAuthenticated(req: Request, res: Response, next: NextFunction) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.status(403).json({ message: 'Forbidden' });
    };


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