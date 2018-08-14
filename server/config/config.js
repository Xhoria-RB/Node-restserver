/**
 * Puerto
 * Indica que se le asignara el valor de la variable port dependiendo del entorno al process y de no haber se usara
 * el puerto 3000
 */
process.env.PORT = process.env.PORT || 3000;


/**
 * Entorno
 * La variable de Node_Env la define heroky, asi que si no existe se asume desarrollo
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/**
 * Expiracion Token
 */

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;


/**
 * SEED de autenticación
 */
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';


/**
 * DataBase
 */

let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB; //En el proccess no existe URLDB, asi que es una variable creada para almacenar urlDB
