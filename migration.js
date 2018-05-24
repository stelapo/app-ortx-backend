let express = require('express');
let Promise = require('bluebird');
let sqlite = require('sqlite');

const app = express();
const port = process.env.PORT || 3000;

const dbPromise = Promise.resolve()
    .then(() => sqlite.open('./database.sqlite', {
        Promise
    }))
    .then(db => db.migrate({
        force: 'last'
    }));

//app.use( /* app routes */ );

//app.listen(port);