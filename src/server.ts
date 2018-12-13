import App from "./app";
import mongoose from 'mongoose';
import Config from "./config";
import Metadata from './aadutils';
//let sqlite = require('sqlite');
import sqlite3 from 'sqlite3';
import Utils from './utils';


/*let sqlitedbPromise = Promise.resolve()
    .then(() => sqlite.open('./database.sqlite', {
        Promise
    }))
    .then(db => db.migrate({
        force: 'last'
    }));*/
let sqliteDb = new sqlite3.Database('./database.sqlite');

let conf: Config = new Config();
Utils.c = conf;
let app: App = new App(conf, sqliteDb);
let express = app.express;
let logger = app.logger;
Utils.l = logger;
//let aadutils = new Metadata(conf.creds.federation_metadata);

mongoose.Promise = global.Promise;
const mongodb = mongoose.connect(conf.mongoUrl, { db: { readPreference: 'PRIMARY' }, readPreference: 'PRIMARY' });
//var db = mongoose.connection;


mongodb.then((db) => {
  express.listen(conf.port, (err: any) => {
    if (err) {
      logger.error(err);
      return console.log(err);
    }

    logger.debug(`Server is listening on ${conf.port}`);

    app.prepareFileManage(db);


    return;
  });
}).catch((err: Error) => { console.error(err) });