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
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'canceled', 'completed'),
    defaultValue: 'scheduled',
  },
  clientId: {
    type: DataTypes.INTEGER,
    references: {
      model: Client,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  timestamps: true,
});

// Relación entre modelos
Client.hasMany(Appointment, { foreignKey: 'clientId' });
Appointment.belongsTo(Client, { foreignKey: 'clientId' });

module.exports = Appointment;
