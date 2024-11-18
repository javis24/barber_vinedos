const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Client = require('./Client');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'cancelled', 'completed'),
    allowNull: false,
    defaultValue: 'scheduled', // Estado inicial
  },
}, {
  timestamps: true, // Añade createdAt y updatedAt automáticamente
  tableName: 'appointments', // Nombre de la tabla en la base de datos
});

// Relación: un cliente puede tener muchas citas
Client.hasMany(Appointment, { foreignKey: 'clientId', onDelete: 'CASCADE' });
Appointment.belongsTo(Client, { foreignKey: 'clientId', onDelete: 'CASCADE' });

module.exports = Appointment;
