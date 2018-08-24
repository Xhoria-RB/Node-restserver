const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');


// default options
app.use(fileUpload());
//Al usar este middleware todo lo que se cargue mediante fileUpload va a req.files automaticamente


app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo'
            }
        });
    }

    //Validar tipo
    let tiposValidos = ['productos', 'usuarios']

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las tipos permitidas son: ' + tiposValidos.join(', ')
            }
        })
    }



    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file.
    //El nombre debe ser el campo al que asignamos la carga del archivo
    let archivoCargado = req.files.archivo;
    let nombreCortado = archivoCargado.name.split('.')
    let extension = nombreCortado[nombreCortado.length - 1];


    //Extensiones válidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg']

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        })
    }

    //Cambiar el nombre del archivo a uno único>>> id del usuario + milisegundos actuales + extension del archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`

    // if (tipo === 'productos') {
    //     borrarProducto(id)
    // }

    // Use the mv() method to place the file somewhere on your server
    archivoCargado.mv(`uploads/${tipo}/${ nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: true,
                err
            })
        switch (tipo) {
            case 'usuarios':
                //Imagen cargada
                imagenUsuario(id, nombreArchivo, res);

                break;

            case 'productos':
                //Imagen cargada
                imagenProducto(id, nombreArchivo, res);

                break;
            default:

                res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Las tipos permitidas son: ' + tiposValidos.join(', ')
                    }
                })
                break;
        }

    });
});
//Js cuando se manda un objeto como parámetro siempre lo pasa por referencia
function imagenUsuario(id, nombreArchivo, res) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo('usuarios', nombreArchivo) //Aunque de error, la imagen ya se subió por la que hay que borrarla
            return res.status(500).json({
                ok: true,
                err
            })
        }

        if (!usuarioDB) {
            borrarArchivo('usuarios', nombreArchivo) //Aunque de error, la imagen ya se subió por la que hay que borrarla
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            })
        }

        borrarArchivo('usuarios', usuarioDB.img)

        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })
    })
}

function imagenProducto(id, nombreArchivo, res) {

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo('productos', nombreArchivo) //Aunque de error, la imagen ya se subió por la que hay que borrarla
            return res.status(500).json({
                ok: true,
                err
            })
        }

        if (!productoDB) {
            borrarArchivo('productos', nombreArchivo) //Aunque de error, la imagen ya se subió por la que hay que borrarla
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            })
        }
        borrarArchivo('productos', productoDB.img);
        productoDB.img = nombreArchivo
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: productoDB.img
            });

        })


    });


};

function borrarProducto(id) {

    //Usa path para construir el path al archivo
    let pathImagen = path.resolve(__dirname, `../../uploads/productos/`);
    fs.readdir(pathImagen, (err, imagenP) => { //devuelve un array con los archivos dentro del directorio

        if (err) { //error en caso de falla
            return res.json({
                err
            })
        }
        let img = imagenP.filter((el) => { //devuelve un array de elementos que cumplan con la funcion
            return el.toLowerCase().indexOf(id.toLowerCase()) > -1; //funcion que busca el index del elemento 
        }); //En este caso mandamos el id y la funcion devuelve el archivo que mas coincida con el id 

        borrarArchivo('productos', img[0]); //llamamos la funcion de borrar archivo y pasamos el archivo encontrado

    })

};



function borrarArchivo(tipo, nombreImagen) {


    //Recordamos que el path.resolve aquiere segmentos de la ruta en cuestion
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen); //Cuidado que se pueden borrar cosas indeseadas
    }

}


module.exports = app;
