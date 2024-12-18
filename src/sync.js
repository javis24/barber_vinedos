const { sequelize, Station, User, Client, Appointment } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados correctamente.');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  } finally {
    process.exit();
  }
})();
