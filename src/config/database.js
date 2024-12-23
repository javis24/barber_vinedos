const { Sequelize } = require('sequelize');
require('dotenv').config(); 

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: process.env.MYSQL_DIALECT || "mysql",
    dialectModule: require("mysql2"),
    logging: false,
    timezone: "-06:00", // Configuración para la zona horaria
    dialectOptions: {
      timezone: "-06:00", // Compatibilidad adicional con MySQL
      connectTimeout: 10000, // Opcional: Tiempo de espera para la conexión
    },
  }
);

// Configurar la zona horaria al conectar
sequelize.beforeConnect((connection) => {
  connection.query("SET time_zone = '-06:00';");
});

module.exports = sequelize;