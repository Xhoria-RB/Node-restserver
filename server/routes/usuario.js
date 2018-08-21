const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const app = express();
const Usuario = require('../models/usuario');
const { verifyToken, verifyAdmin_Role } = require('../middlewares/authentication');


// Get
//verifyToken no se hace llamada a la funcion porque se está solo asignando un middleware a la peticion get, no haciendo
//una llamada a la función
app.get('/usuario', verifyToken, (req, res) => {


    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email,
    //     role: req.usuario.role
    // })


    let desde = req.query.desde || 0; //req.query busca los parametros opcionales pasados en la url>> url?[params]=[value]
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role google img') //En el metodo find si no se especifica nada trae todo, sino busca segun lo especificado
        // el string pasado como 2do argumento define los campos que se quieren desplegar en el objeto (projection en la api doc de Mongoose)
        .skip(desde) //Salta x cantidad de registros
        .limit(limite) //Establece un limite de registros al find
        .exec((err, usuarios) => { //Indica que se ejecutara 
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            //count debe recibir exactamente el mismo argumento que find para que cuenten bajo el mismo esquema
            Usuario.count({ estado: true }, (err, conteo) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                })
            })


        });



});


//Crear usuario
//Post
app.post('/usuario', [verifyToken, verifyAdmin_Role], (req, res) => {
    let body = req.body;

    //Cada instancia de usuario tendra el modelo, de ahi podemos pasarle parametros al constructor
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    //save es una keyword de mongo, que guarda en la BD. Recibe un callback(err, callback)
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //funcion momentanea para que no salga el password
        // usuario.password = null; Ver Schema para mas info

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    })


});

//Put
app.put('/usuario/:id', [verifyToken, verifyAdmin_Role], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);


    //Doc de Mongoose>> findByIdAndUpdate(id(to find), update(objet updated), options(object of options), callback)
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        //La opcion de runValidators es para que corra las validaciones hechas en el Schema    
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })

    })




});


//Delete
app.delete('/usuario/:id', [verifyToken, verifyAdmin_Role], (req, res) => {
    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario_borrado: usuarioBorrado
        })



    })
});



module.exports = app;
