import express from "express";
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import Config from './config';
import Utils from './utils';
import Logger from './logger';
import { DailyRotateFileTransportInstance } from 'winston';
//import * as path from "path";

class App {
    public express: any;
    private conf: Config;
    private logger: Logger;

    constructor(conf: Config) {
        this.conf = conf;
        this.logger = new Logger('serverLog', this.conf.winstonFilename);
        this.express = express();
        this.mountHomeRoute();
        this.logger.info('END App Constructor');
        /*this.prepareStatic();
        this.setViewEngine();*/
    }
    /*
        // This serves everything in `static` as static files
        private prepareStatic(): void {
         this.express.use(express.static(path.join(__dirname, "/../static/")));
        }
    */
    private prepare(): void {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(logErrors);
        this.express.use(clientErrorHandler);
        this.express.use(errorHandler);
        this.express.use(morgan('combined'));
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
            this.logger.info('GET /');
            res.json({
                message: "Hello World!"
            });
        });
        this.express.use(router);
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