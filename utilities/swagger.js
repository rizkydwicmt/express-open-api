const swaggerUi = require('swagger-ui-express');
// const swaggerJsdoc = require('swagger-jsdoc');
swaggerDocument = require('../swagger.json')

// const options = {
//   swaggerDefinition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'My API',
//       version: '1.0.0',
//       description: 'My API description',
//     },
//   },
//   apis: ['./routes/*.js', './routes/v1/*.js'], // Path to the API routes
// };

// const specs = swaggerJsdoc(options);

module.exports = function (app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};