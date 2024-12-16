const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Station = sequelize.define('Station', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
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
    defaultValue: 60,
  },
});

module.exports = Station;
