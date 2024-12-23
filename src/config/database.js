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
    timezone: "-06:00", // Configuración para que Sequelize maneje la zona horaria
    dialectOptions: {
      timezone: "local", // Cambia a "local" para usar la zona horaria del sistema
      connectTimeout: 10000, // Opcional
    },
  }
);

// Configurar manualmente la zona horaria para MySQL
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.query("SET time_zone = '-06:00';");
    console.log("Zona horaria configurada correctamente en MySQL");
  } catch (error) {
    console.error("Error configurando la zona horaria:", error);
  }
})();

module.exports = sequelize;
