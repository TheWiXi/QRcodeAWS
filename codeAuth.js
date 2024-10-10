const { 
  CognitoIdentityProviderClient, 
  InitiateAuthCommand,
  RespondToAuthChallengeCommand 
} = require("@aws-sdk/client-cognito-identity-provider");
const crypto = require('crypto');

const CLIENT_ID = "7ofj83r9k1vjreeniev88758nc";
const CLIENT_SECRET = "cb5h6u4i067uqcacs2ftcbmhjlmjml881ke957m0gppi0gdu69d";

function calculateSecretHash(username, clientId, clientSecret) {
  const message = username + clientId;
  const hmac = crypto.createHmac('sha256', clientSecret);
  hmac.update(message);
  return hmac.digest('base64');
}

async function handleNewPasswordChallenge(username, session, newPassword) {
  const client = new CognitoIdentityProviderClient({ region: "us-east-1" });
  const secretHash = calculateSecretHash(username, CLIENT_ID, CLIENT_SECRET);

  const command = new RespondToAuthChallengeCommand({
    ChallengeName: "NEW_PASSWORD_REQUIRED",
    ClientId: CLIENT_ID,
    ChallengeResponses: {
      USERNAME: username,
      NEW_PASSWORD: newPassword,
      SECRET_HASH: secretHash
    },
    Session: session
  });

  try {
    const response = await client.send(command);
    console.log("Respuesta del cambio de contraseña:", JSON.stringify(response, null, 2));
    return response.AuthenticationResult;
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    throw error;
  }
}

async function getCodeAuth(username, password, newPassword) {
  const client = new CognitoIdentityProviderClient({ region: "us-east-1" });
  const secretHash = calculateSecretHash(username, CLIENT_ID, CLIENT_SECRET);

  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
      SECRET_HASH: secretHash
    }
  });

  try {
    const response = await client.send(command);
    
    if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
      console.log("Se requiere cambio de contraseña. Procesando...");
      return await handleNewPasswordChallenge(username, response.Session, newPassword);
    }
    
    return response.AuthenticationResult;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
}

// Obtener argumentos de la línea de comandos
const username = process.argv[2];
const currentPassword = process.argv[3];
const newPassword = process.argv[4];

if (!username || !currentPassword || !newPassword) {
  console.error("Por favor, proporciona el usuario, la contraseña actual y la nueva contraseña como argumentos:");
  console.error("node codeAuth.js <usuario> <contraseña_actual> <nueva_contraseña>");
  process.exit(1);
}

getCodeAuth(username, currentPassword, newPassword)
  .then(result => {
    if (result && result.AccessToken) {
      console.log("Login exitoso!");
      console.log("Access Token:", result.AccessToken);
      console.log("ID Token:", result.IdToken);
      console.log("Refresh Token:", result.RefreshToken);
    } else {
      console.log("No se pudo obtener el token");
    }
  })
  .catch(error => {
    console.error("Error en la ejecución:", error);
    process.exit(1);
  });