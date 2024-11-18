const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const Client = sequelize.define('client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: true, // Habilita las columnas createdAt y updatedAt automáticamente
});

module.exports = Client;
