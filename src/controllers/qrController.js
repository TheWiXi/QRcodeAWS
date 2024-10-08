const QRCode = require('../models/QRcode');
const URLValidator = require('../utils/urlValidator');

class QRController {
  static async generateQR(req, res) {
    try {
      const { url } = req.body;
      
      if (!URLValidator.isValid(url)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid URL format' 
        });
      }

      const qrCode = new QRCode(url);
      const result = await qrCode.save();
      
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in QRController:', error);
      return res.status(500).json({
        success: false,
        error: 'Error generating QR code'
      });
    }
  }
}

module.exports = QRController;