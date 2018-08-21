const express = require('express');
const { verifyToken } = require('../middlewares/authentication');
const Producto = require('../models/producto');
const Categoria = require('../models/categoria');

const app = express();

//========================
// Obtener productos
//========================
app.get('/productos', verifyToken, (req, res) => {
    //Trae todos los productos
    //Populate: usuario y categoria
    //paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .skip(desde)
        .limit(limite)
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.count({ disponible: true }, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    producto: productos,
                    total_productos: conteo
                });



            });


        });
});

//=============================
// Obtener un productos por ID
//=============================
app.get('/productos/:id', verifyToken, (req, res) => {
    //Populate: usuario y categoria

    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Id de producto incorrecto'
                    }
                });
            }
            res.json({
                ok: true,
                producto: productoDB
            })
        });

});

//========================
// Busca un productos
//========================
app.get('/productos/buscar/:termino', verifyToken, (req, res) => {
    //La busqueda para que salga todo lo aproximado
    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i'); //i significa indiferente a mayus o minus
    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })
        })
});

//========================
// Crear un productos
//========================
app.post('/productos', verifyToken, (req, res) => {
    //Grabar el usuario
    //grabar una categoria del listado
    //Find one busca un documento(registro) en base al parametro pasado. findOne({[argumento: valor]}, 'campos a mostrar', callback)

    let id = req.usuario._id;
    let body = req.body;

    Categoria.findOne({ descripcion: body.categoria }, 'descripcion', (err, categoria) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        let producto = new Producto({
            nombre: body.nombre,
            precioUni: body.precioUni,
            descripcion: body.descripcion,
            categoria: categoria._id,
            usuario: id
        })

        producto.save((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!categoria) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'La categoria no existessssss'
                    }
                });
            }
            //Se puede mandar el status 201 para nuevo registro, pero es opcional
            res.status(201).json({
                ok: true,
                producto: productoDB
            })


        });


    })
});

//========================
// Actualizar un productos
//========================
app.put('/productos/:id', verifyToken, (req, res) => {

    let id = req.params.id;

    Categoria.findOne({ descripcion: req.body.categoria }, 'descripcion', (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria incorrecta'
                }
            });
        }


        let body = {
            nombre: req.body.nombre,
            precioUni: req.body.precioUni,
            descripcion: req.body.descripcion,
            categoria: categoriaDB
        }

        Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto incorrecto'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            })
        });
    });


});

//========================
// Borrarr un productos
//========================
app.delete('/productos/:id', verifyToken, (req, res) => {
    //El producto debe deshabilitarse >>> disponible: false

    let id = req.params.id;
    let estadoProducto = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, estadoProducto, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto incorrecto'
                }
            });
        }

        res.json({
            ok: true,
            producto_borrado: productoBorrado
        })
    })
});



module.exports = app;
