// import { Document } from 'mongoose';
import express from "express";
import * as core from "express-serve-static-core";
import { Request, Response, NextFunction } from 'express';
// import session from 'express-session';
// import connectmongo from 'connect-mongo';
import bodyParser from 'body-parser';
// import passport from 'passport'; // commentato per passaggio a gestione login con jwt
// import OAuth2Strategy from 'passport-oauth2';  // commentato per passaggio a gestione login con jwt
import morgan from 'morgan';
import Config from './config';
import Utils from './utils';
import Logger from './logger';
import PADLogger from './padLogger';
import { DailyRotateFileTransportInstance } from 'winston';
//import UserModel from "./models/User";
import * as jwt from 'jsonwebtoken';
import BaseCtrl from "./controllers/BaseCtrl";
import UserCtrl from './controllers/UserCtrl';
import DivisionCtrl from './controllers/DivisionCtrl';
import CustomerCtrl from './controllers/CustomerCtrl';
import OfferCtrl from './controllers/OfferCtrl';
import OfferStateCtrl from './controllers/OfferStateCtrl';
import DocTypeCtrl from './controllers/DocTypeCtrl';
import FileCtrl from './controllers/FileCtrl';
import sqlite3, { RunResult, Statement } from 'sqlite3';
import uuid from 'node-uuid';
var expressHttpContext = require('express-http-context');
import permit from './security/permissions';
import GridFSStorage from "multer-gridfs-storage";
import multer = require("multer");
import Grid from "gridfs-stream";
import { Mongoose } from "mongoose";

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
        // this.preparePassport(); // commentato per passaggio a gestione login con jwt
        //Routes
        this.mountPublicRoute();
        this.mountApiRoutes();
        // this.prepareFileManage();

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
            res.header("Access-Control-Allow-Headers", "Origin, Accept,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
            res.header("Access-Control-Allow-Credentials", "true");
            // intercept OPTIONS method
            if ('OPTIONS' == req.method) {
                res.sendStatus(200);
            }
            else {
                next();
            }
        });
    }

    // commentato per passaggio a gestione login con jwt
    /*private preparePassport(): void {
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
    }*/

    // Prepare the / route to show a hello world page
    private mountPublicRoute(): void {
        this._express.get("/home", (req, res) => {
            res.json({
                message: "Hello World!"
            });
        });

        const userTypeCtrl = new UserCtrl(this._conf.bcrypt_psw);
        this._express.post("/register", userTypeCtrl.insert);
        this._express.post("/login", userTypeCtrl.login);

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
        //DocTypes
        const docTypeCtrl = new DocTypeCtrl();
        this.mountApiRoutesFromCtrl(docTypeCtrl, '/docTypes');
        //Files
        const fileCtrl = new FileCtrl();
        this.mountApiRoutesFromCtrl(fileCtrl, '/filectrl');
    }

    private mountApiRoutesFromCtrl(ctrl: BaseCtrl, path: string) {
        const router = express.Router();
        //router.use(passport.authenticate('oauth-bearer', { session: false })); --autenticazione con oauth azure
        router.route('/count').get(ctrl.count);
        router.route('/').get(ctrl.getAll);
        router.route('/p/').get(ctrl.getAllPopulated);
        router.route('/').post(ctrl.insert);
        router.route('/:id').get(ctrl.get);
        router.route('/p/:id').get(ctrl.getPopulated);
        router.route('/:id').put(ctrl.update);
        router.route('/:id').delete(ctrl.delete);
        this._express.use(path, permit(this._conf.bcrypt_psw, 'admin', 'user'), router); //this._express.use(path, router);
    }

    public prepareFileManage(database: Mongoose): void {
        this._logger.debug('Preparing GridFSStorage...');

        let gfs = Grid(database.connection, database.mongo);
        let myMongoCLient: any;
        database.mongo.connect(this._conf.mongoUrl).then((client) => {
            myMongoCLient = client;
        });

        let mystorage = new GridFSStorage({
            // url: this._conf.mongoUrl,
            db: database,
            // options: { root: 'ctFiles' },
            file: function (req, file) {
                // console.log(`File ${file.originalname}`);
                return {
                    filename: file.originalname,
                    metadata: {
                        extension: file.originalname.split('.')[file.originalname.split('.').length - 1],
                        encoding: file.encoding // ,
                        // filename: file.originalname,
                        // user: req.user,
                        // tags: []
                    }
                }
            }
        });
        mystorage.on('streamError', (err) => {
            this._logger.debug("streamError!!!!!");
            this._logger.debug(err);
        });
        mystorage.on('dbError', (err) => {
            this._logger.debug("dbError!!!!!");
            this._logger.debug(err);
        });
        mystorage.on('connection', (db) => {
            this._logger.debug("connection!!!!!");
        });
        mystorage.on('connectionFailed', (err) => {
            this._logger.debug(err);
        });
        mystorage.on('file', (file) => {
            this._logger.debug("uploaded file!!!!!");
            this._logger.debug(JSON.stringify(file));
        });

        const upload = multer({ //multer settings for upload
            storage: mystorage
        }).single('file');

        this._express.post('/uploadFile', permit(this._conf.bcrypt_psw, 'admin', 'user'), (req, res) => {
            this._logger.debug('called /uploadFile');
            upload(req, res, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500);
                    res.send(err);
                } else {
                    // console.log(req.file);
                    res.json({
                        file_uploaded: true,
                        file: req.file
                    });
                }
            });
        });

        /*this._express.get('/filebyname/:filename', permit(this._conf.bcrypt_psw, 'admin', 'user'), (req, res) => {
            gfs.collection('fs'); //set collection name to lookup into

            gfs.files.find({ filename: req.params.filename }).toArray(function (err, files) {
                console.debug('Searching file ' + req.params.filename);
                if (!files || files.length === 0) {
                    return res.status(404).json({
                        responseCode: 1,
                        responseMessage: "any file found"
                    });
                }
                // create read stream
                let options = {
                    filename: files[0].filename //,
                    //root: 'fs.files'
                };
                var readstream = gfs.createReadStream(options);

                //error handling, e.g. file does not exist
                readstream.on('error', function (err) {
                    console.log('readstream:: An error occurred!', err);
                    throw err;
                });

                // set the proper content type 
                res.set('Content-Type', files[0].contentType)
                // Return response
                return readstream.pipe(res);
            });
        });*/

        this._express.get('/searchfilebyname/:filename', permit(this._conf.bcrypt_psw, 'admin', 'user'), (req, res) => {
            gfs.collection('fs'); //set collection name to lookup into

            gfs.files.find({ filename: req.params.filename }).toArray(function (err, files) {
                console.debug('Searching file ' + req.params.filename);
                if (!files || files.length === 0) {
                    return res.status(404).json({
                        responseCode: 1,
                        responseMessage: "any file found"
                    });
                } else {
                    res.setHeader("Content-Type", 'application/json');
                    res.status(200).send(files);
                }
            });
        });

        this._express.get('/file/:id', permit(this._conf.bcrypt_psw, 'admin', 'user'), (req, res) => {
            gfs.collection('fs'); //set collection name to lookup into

            var o_id = new database.mongo.ObjectID(req.params.id);

            gfs.files.findOne({ _id: o_id }).then((file) => {
                console.debug('Found file ' + req.params.id);
                if (!file) {
                    return res.status(404).json({
                        responseCode: 1,
                        responseMessage: "any file found"
                    });
                }

                res.setHeader("Content-Type", file.contentType);
                res.setHeader("Content-Length", file.length);

                let gfsBucket = new database.mongo.GridFSBucket(myMongoCLient.db(), {
                    chunkSizeBytes: 1024
                });

                gfsBucket.openDownloadStreamByName(file.filename).
                    pipe(res /*fs.createWriteStream('./incontro_a_modena_SOGEGROSS.txt')*/).
                    on('error', function (error) {
                        console.debug('File download error');
                        console.debug(error);
                    }).
                    on('finish', function () {
                        console.debug('File downloaded!');
                        res.end(); //process.exit(0);
                    });
            }).catch((err) => {
                console.debug('Error downloading file...');
                console.debug(err);
                return res.status(404).json({
                    responseCode: 1,
                    responseMessage: "error downloading file",
                    error: err.message
                });
            });
        });
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