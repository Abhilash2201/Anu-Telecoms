import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { openapiDocument } from '../docs/openapi.js';

const router = express.Router();

router.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(openapiDocument, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true
    }
  })
);

router.get('/json', (req, res) => {
  res.json(openapiDocument);
});

export default router;
