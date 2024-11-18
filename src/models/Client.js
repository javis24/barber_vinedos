const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      isNumeric: true,
    },
  },
}, {
  timestamps: true, // Añade createdAt y updatedAt automáticamente
  tableName: 'clients', // Nombre de la tabla en la base de datos
});

module.exports = Client;
