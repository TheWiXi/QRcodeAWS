const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Configura el cliente para obtener las claves públicas de Cognito (JWKs)
const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`
});

// Función para obtener la clave correcta (JWK) para la verificación del JWT
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Middleware de autenticación
function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'No token provided, unauthorized' });
  }

  // Eliminar el prefijo "Bearer " del token si existe
  const jwtToken = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

  jwt.verify(jwtToken, getKey, {
    audience: process.env.COGNITO_CLIENT_ID, // El ID del cliente que usas en Cognito
    issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}` // El issuer de Cognito
  }, (err, decoded) => {
    if (err) {
      console.error('JWT verification failed:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Si la verificación es exitosa, guardar los datos del usuario en la solicitud
    req.user = decoded;
    next();
  });
}

module.exports = authMiddleware;
