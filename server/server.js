require('./config/config');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(require('./routes/usuario'));

/**
 * DeprecationWarning: current URL string parser is deprecated, and will be removed in a future version.
 * To use the new parser, pass option { useNewUrlParser: true } to MongoClient.connect.
 * Para solucionar este warning agregamos { useNewUrlParser: true } como opcion al
 * moongoose.connect([connectionString],[connectionOptions],[callback]).
 * Lo mismo seria para el MongoClient.connect.
 */

mongoose.connect(process.env.URLDB, { useNewUrlParser: true }, (err, resp) => {
    if (err) throw err;
    console.log('Base de datos ONLINE!');
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando al puerto: ', process.env.PORT);
});
