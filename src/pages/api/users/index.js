const User = require('../../../models/Users');
const bcrypt = require('bcrypt');

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return await getUsers(req, res);
    case 'POST':
      return await createUser(req, res);
    case 'PUT':
      return await updateUser(req, res);
    case 'DELETE':
      return await deleteUser(req, res);
    default:
      return res.status(405).json({ error: 'Método no permitido' });
  }
}

// Obtener todos los usuarios
async function getUsers(req, res) {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
}

// Crear un nuevo usuario
async function createUser(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Por favor, llena todos los campos obligatorios' });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: 'Formato de correo inválido' });
  }

  try {
    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: role || 'user',
    });

    res.status(201).json({ message: 'Usuario creado con éxito', user });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'El correo ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error al crear el usuario' });
    }
  }
}

// Actualizar un usuario existente
async function updateUser(req, res) {
  const { id, name, email, password, role } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'El ID del usuario es obligatorio' });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({ message: 'Usuario actualizado con éxito', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
}

// Eliminar un usuario (usando query params)
async function deleteUser(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'El ID del usuario es obligatorio' });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await user.destroy();

    res.status(200).json({ message: 'Usuario eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
}
