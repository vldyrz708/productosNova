const swaggerAutoGen = require('swagger-autogen');

const outputFile = './swagger.json';
const endpointsFiles = ['./index.js'];

const doc = {
    info: {
        title: 'API Tienda de Ropa',
        description: 'API para gestionar una tienda de ropa',
    },
    host: 'localhost:3000',
    schemes: ['http'],
}
swaggerAutoGen()(outputFile, endpointsFiles, doc);