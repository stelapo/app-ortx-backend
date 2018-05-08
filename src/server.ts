import App from "./app";
import mongoose from 'mongoose';
import Config from "./config";

let conf:Config = new Config();
let app:App = new App(conf);
let express = app.express;

express.listen(conf.port, (err: any) => {
  if (err) {
      return console.log(err);
  }

  return console.log(`server is listening on ${conf.port}`);
});