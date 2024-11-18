const sequelize = require('./config/database'); // Ruta relativa dentro de `src`
const Client = require('./models/Client');
const Appointment = require('./models/Appointment');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión exitosa a la base de datos.');

    // Sincronizar tablas
    await sequelize.sync({ force: true }); // Elimina y recrea las tablas
    console.log('Tablas creadas con éxito.');
  } catch (error) {
    console.error('Error al sincronizar modelos:', error.message);
  } finally {
    await sequelize.close();
  }
})();
