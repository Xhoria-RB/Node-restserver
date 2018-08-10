/**
 * Puerto
 * Indica que se le asignara el valor de la variable port dependiendo del entorno al process y de no haber se usara
 * el puerto 3000
 */
process.env.PORT = process.env.PORT || 3000;