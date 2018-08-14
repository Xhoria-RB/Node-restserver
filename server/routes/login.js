const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    //Funcion que devuelve solo un caso donde la condicion sea true ({condicion(como objeto)}, callback(err, resp))
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            //Err 500 porque solo se dispara si hay un error interno de la BD
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            //Err 400 bad request
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña no válido'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) no válido'
                }
            });
        }

        let token = jwt.sign({
                usuario: usuarioDB
            }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }) //60 * 60 equivale a 1 hora, para que sea a dias debe convertirse
            //seg * min * hours * days >>> 60 * 60 * 24 * 30 >>> Expira en 30 dias

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        })


    })



});


module.exports = app;
