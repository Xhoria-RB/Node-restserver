//Modelo de datos

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema; //Funcion de la que crearemos mas objetos (nomenclatura primera letra Mayus)
/**
 * Despues de difinir el nuevo Schema tenemos que definir las reglas y controles del mismo
 *  (los campos que tendra la coleccion)
 */

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
}; // Esto va en la enum, que indica cuales son los valores validos para ese campo

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    google: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    img: {
        type: String,
        required: false //no es necesario ponerlo si no es obligatoria, pero se puede para ser mas especificos
    },
    estado: {
        type: Boolean,
        default: true
    }

});
/**
 * El metodo toJSON siempre se llama en un Schema cuando se va a imprimir, asi que para excluir un dato de que no
 * se imprima podemos modificar ese metodo. NO USAR FUNCION DE FLECHA YA QUE SE NECESITA EL THIS. Recordando que el this
 * en una funcion de flecha apunta al objeto global.
 * Al Schema se le pueden agregar  o modificar metodos similar a los prototipos en JS
 */
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
};

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })
    // {PATH} es como mongoose inyecta el email al error, OJO no son `` son ''
module.exports = mongoose.model('Usuario', usuarioSchema);
//Aqui se define el nombre del modelo ya en fisico y el contenido que tendra([nombre], contenido)