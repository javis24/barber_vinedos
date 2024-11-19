import Client from './Client';
import Appointment from './Appointment';

// Configurar relaciones
Client.hasMany(Appointment, { foreignKey: 'clientId', onDelete: 'CASCADE' });
Appointment.belongsTo(Client, { foreignKey: 'clientId' });

const models = { Client, Appointment };

export default models;
