const sequelize = require('../config/database');
const Station = require('./Station');
const User = require('./Users');
const Client = require('./Client');
const Appointment = require('./Appointment');

// Relaciones
Appointment.belongsTo(Station, { foreignKey: 'stationId', as: 'Station' });
Station.hasMany(Appointment, { foreignKey: 'stationId', as: 'Appointments' });

Appointment.belongsTo(Client, { foreignKey: 'clientId', as: 'Client' });
Client.hasMany(Appointment, { foreignKey: 'clientId', as: 'Appointments' });

module.exports = {
  sequelize,
  Station,
  User,
  Client,
  Appointment,
};
