const bcrypt = require('bcrypt');
const User = require('../../../models/Users');
const { generateToken } = require('../../../utils/jwt');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      // Buscar al usuario por email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar la contraseña
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      // Generar el token JWT
      const token = generateToken(user);

      // Enviar el token y los datos del usuario
      res.status(200).json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
