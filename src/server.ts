import App from "./app";
import mongoose from 'mongoose';
import Config from "./config";
import Metadata from './aadutils';
//let sqlite = require('sqlite');
import sqlite3 from 'sqlite3';


/*let sqlitedbPromise = Promise.resolve()
    .then(() => sqlite.open('./database.sqlite', {
        Promise
    }))
    .then(db => db.migrate({
        force: 'last'
    }));*/
let sqliteDb = new sqlite3.Database('./database.sqlite');

let conf: Config = new Config();
let app: App = new App(conf, sqliteDb);
let express = app.express;
let logger = app.logger;
let aadutils = new Metadata(conf.creds.federation_metadata);

mongoose.Promise = global.Promise;
const mongodb = mongoose.connect(conf.mongoUrl);



mongodb.then((db) => {
  express.listen(conf.port, (err: any) => {
    if (err) {
      return console.log(err);
    }

    logger.debug(`Server is listening on ${conf.port}`);
    return;
  });
}).catch((err: Error) => { console.error(err) });