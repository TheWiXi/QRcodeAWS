const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const qrRoutes = require('./routes/qrRoute');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', qrRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));