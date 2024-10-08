const express = require('express');
const router = express.Router();
const QRController = require('../controllers/qrController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/generate-qr', authMiddleware, QRController.generateQR);

module.exports = router;