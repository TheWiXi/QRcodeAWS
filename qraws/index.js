const QRCode = require('./models/QRCode');
const URLValidator = require('./utils/urlValidator');

exports.handler = async (event) => {
  try {
    // Parsear el body del evento
    const body = JSON.parse(event.body || '{}');
    const { url } = body;
    
    // Validar URL
    if (!url || !URLValidator.isValid(url)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'Invalid URL format'
        })
      };
    }

    // Generar y guardar QR code
    const qrCode = new QRCode(url);
    const result = await qrCode.save();
    
    // Retornar respuesta exitosa
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        data: result
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Error generating QR code'
      })
    };
  }
};