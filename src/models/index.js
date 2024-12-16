import { Sequelize } from 'sequelize';
import sequelize from '../config/database'; // Asegúrate de que la ruta sea correcta
import Client from './Client';
import Appointment from './Appointment';
import Station from './Station'; // Importa el modelo Station si está definido

// Configurar relaciones
Client.hasMany(Appointment, { foreignKey: 'clientId', onDelete: 'CASCADE' });
Appointment.belongsTo(Client, { foreignKey: 'clientId' });

Station.hasMany(Appointment, { foreignKey: 'stationId', onDelete: 'CASCADE' });
Appointment.belongsTo(Station, { foreignKey: 'stationId' });

// Exportar modelos
const models = {
  Client,
  Appointment,
  Station,
  sequelize,
  Sequelize,
};

export default models;
