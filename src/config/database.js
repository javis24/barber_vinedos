const { Sequelize } = require("sequelize");
require("dotenv").config();

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
      timezone: "local", // Intenta también con 'local' si '-06:00' no funciona
    },
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión exitosa con Sequelize.");
  } catch (error) {
    console.error("Error conectando a la base de datos:", error);
  }
})();

module.exports = sequelize;
