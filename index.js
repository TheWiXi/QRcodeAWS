const express = require('express');
const cors = require('cors');
const qrRoutes = require('./routes/qrRoute');
const serverless = require('serverless-http');  // Agregar serverless-http para Lambda

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', qrRoutes);

// Elimina app.listen()

module.exports.handler = serverless(app);  // Exportar para Lambda
