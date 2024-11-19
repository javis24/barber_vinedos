const jwt = require('jsonwebtoken');

// Generar un token JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET, // Usa una clave secreta almacenada en .env
    { expiresIn: '1h' } // El token expira en 1 hora
  );
};

// Verificar un token JWT
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
