import sequelize from './config/database';
import './models/Client';
import './models/Appointment';

const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true }); // Utiliza `alter: true` para aplicar cambios
    console.log('Base de datos sincronizada');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
};

syncDB();
