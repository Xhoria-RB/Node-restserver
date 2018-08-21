const express = require('express');

const { verifyToken, verifyAdmin_Role } = require('../middlewares/authentication');
const _ = require('underscore');

const app = express();
const Categoria = require('../models/categoria');

//========================================================================
//Muestra todas las categorias. La paginación es opcional
//========================================================================
app.get('/categoria', verifyToken, (req, res) => {
    //req.query obtiene los parámetros opcionales de la url, deben ser convertidos a Number para usarlos como números
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 10;
    limite = Number(limite);

    //Función de búsqueda de mongoose find({[args], 'campos a mostrar'}). sort permite organizar en base a un campo
    //El populate te permite cargar informacion de otras tablas('[nombre del campo de iD]', '[campos a incluir]'). Si queremos
    //Agregar mas  collecciones porque el Schema nos lo pide, agremamos mas lineas de populate
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(limite)
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            //Función de conteo de registros, debe llevar el mismo argumento del find para que cuente los finds count({[args], callback})
            Categoria.count({}, (err, conteo) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                })
            });
        });

});

//========================================================================
//Muestra una categoria por ID.
//========================================================================
app.get('/categoria/:id', verifyToken, (req, res) => {
    //Debe mostrar la info de la categoria como tal Categoria.findById(...)
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Id de categoria incorrecto'
                }
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        })


    })



});

//========================================================================
//Crear una categoria
//========================================================================
app.post('/categoria', verifyToken, (req, res) => {
    //crea y regresa la nueva categoria
    // id del usuario >>> req.usuario._id Recordando que al pasar por el verifyToken la req ya tiene el payload del token

    let id = req.usuario._id;
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })





});

//========================================================================
//Servicio get que muestra todas las categorias. La paginación es opcional
//========================================================================
app.put('/categoria/:id', verifyToken, (req, res) => {
    //Actualizar el nombre

    let id = req.params.id;
    let body = _.pick(req.body, ['descripcion']);

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
});


//========================================================================
//Servicio get que muestra todas las categorias. La paginación es opcional
//========================================================================
app.delete('/categoria/:id', [verifyToken, verifyAdmin_Role], (req, res) => {

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            categoria_borrada: categoriaBorrada
        })
    })


});








module.exports = app;
