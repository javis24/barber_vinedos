const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    dialectModule: require("mysql2"),
    logging: false,
    timezone: "Etc/UTC", // Configura para almacenar en UTC
    dialectOptions: {
      timezone: "Etc/UTC", // Compatibilidad adicional con MySQL
      connectTimeout: 10000,
    },
  }
);
