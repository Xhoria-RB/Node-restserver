const express = require('express');
const app = express();

app.use(require('./login'));
app.use(require('./usuario'));

module.exports = app;
/**
 * Este archivo index es para manejar las rutas de nustro proyecto
 */