const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Station = sequelize.define('Station', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  weekdayStart: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: '11:00:00',
  },
  weekdayEnd: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: '20:00:00',
  },
  saturdayStart: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: '10:00:00',
  },
  saturdayEnd: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: '19:00:00',
  },
  sundayStart: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: '11:00:00',
  },
  sundayEnd: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: '15:00:00',
  },
  intervalMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60, // Intervalos de 60 minutos
  },
});

module.exports = Station;
