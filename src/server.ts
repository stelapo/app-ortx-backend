import App from "./app";
import mongoose from 'mongoose';
import Config from "./config";
import Metadata from './aadutils';


let conf: Config = new Config();
let app: App = new App(conf);
let express = app.express;
let logger = app.logger;
let aadutils = new Metadata(conf.creds.federation_metadata);

mongoose.Promise = global.Promise;
const mongodb = mongoose.connect(conf.mongoUrl);

//console.log('Eccoci!!!!!!!!');

mongodb.then((db) => {
  express.listen(conf.port, (err: any) => {
    if (err) {
      return console.log(err);
    }

    logger.debug(`Server is listening on ${conf.port}`);
    return;
  });
}).catch((err: Error) => { console.error(err) });