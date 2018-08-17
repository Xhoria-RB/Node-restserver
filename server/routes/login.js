const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
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
//Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    console.log(payload.name);
    console.log(payload.email);
    console.log(payload.picture);

    //Como una función async regresa una promesa podemos retornar un objeto personalizado
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}
// verify().catch(console.error);


//Método POST para obtener el token de Google Sign-In y validarlo
app.post('/google', async(req, res) => {

    let token = req.body.idtoken;
    //Como verify regresa una promesa, si queremos asignarla a una variable debemos usar await y por ende hacer el callback
    //del post async
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            })
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            //Err 500 porque solo se dispara si hay un error interno de la BD
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Debe usar sus autenticación normal'
                    }
                });
            } else {
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }


        } else {
            //Si el usuario no existe en la BD

            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.picture;
            usuario.google = true;
            usuario.password = ':)' //Aqui no importa lo que vaya, eso se encriptará y el usuario no podrá autenticarse con esa
                //password, solo es para llenar la validación del password

            usuario.save((err, usuarioDB) => {
                if (err) {
                    //Err 500 porque solo se dispara si hay un error interno de la BD
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })

            })

        }


    })

    // res.json({
    //     usuario: googleUser
    // })
});


module.exports = app;
