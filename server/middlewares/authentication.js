const jwt = require('jsonwebtoken');

/**
 * Verificar Token
 */

let verifyToken = (req, res, next) => {

    let token = req.get('token') //req.get trae los headers de los request, en este caso buscamos token pero puede ser authorization
        // o sea donde mandamos el token es lo que vamos a recibir aqui

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err
            })
        }
        // EL decoded es el payload que obtenemos del token  y como mandamos el usuario en el payload podemos obtenerlo asi
        req.usuario = decoded.usuario;
        next(); //para que continue la ejecucion del programa

    });
}

/**
 * Verifica Admin Role
 */

let verifyAdmin_Role = (req, res, next) => {
    //No es necesario que se verifique el token porque este middleware está después de el verifyToken por tanto el
    // req ya tiene el usuario cargado
    let usuario = req.usuario;

    if (usuario.role !== 'ADMIN_ROLE') {
        return res.status(400).json({
            ok: false,
            error: {
                message: 'El usuario no es administrador'
            }
        })
    }
    next();

};



module.exports = {
    verifyToken,
    verifyAdmin_Role
}
