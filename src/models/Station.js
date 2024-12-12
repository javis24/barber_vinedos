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
});

module.exports = Station;
