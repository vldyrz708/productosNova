const swaggerAutoGen = require('swagger-autogen');

const outputFile = './swagger.json';
const endpointsFiles = ['./index.js'];

const doc = {
    info: {
        title: 'API productos de k-pop',
        description: 'API para gestionar álbumes de k-pop y usuarios en productosNova',
    },
    host: 'localhost:3000',
    schemes: ['http'],
}
swaggerAutoGen()(outputFile, endpointsFiles, doc);