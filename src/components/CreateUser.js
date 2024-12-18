import React, { useState } from 'react';

const CreateUser = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = { name, email, password, role };

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Usuario creado exitosamente');
        setName('');
        setEmail('');
        setPassword('');
        setRole('user');
      } else {
        alert(data.error || 'Error al crear el usuario');
      }
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      alert('Hubo un problema al crear el usuario');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <div className="bg-gray-900 rounded-3xl p-8 shadow-xl w-96">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h1 className="text-white text-center text-2xl mb-4">Crear Usuario</h1>

          {/* Campo Nombre */}
          <div className="flex items-center bg-gray-800 rounded-full p-3">
            <input
              type="text"
              className="bg-transparent outline-none text-white flex-1 ml-3 placeholder-gray-500"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Campo Email */}
          <div className="flex items-center bg-gray-800 rounded-full p-3">
            <input
              type="email"
              className="bg-transparent outline-none text-white flex-1 ml-3 placeholder-gray-500"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Campo Contraseña */}
          <div className="flex items-center bg-gray-800 rounded-full p-3">
            <input
              type="password"
              className="bg-transparent outline-none text-white flex-1 ml-3 placeholder-gray-500"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Selección de Rol */}
          <div className="flex items-center bg-gray-800 rounded-full p-3">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-transparent outline-none text-white flex-1 ml-3 placeholder-gray-500"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Botón de Crear */}
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-full font-semibold transition"
          >
            Crear Usuario
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
