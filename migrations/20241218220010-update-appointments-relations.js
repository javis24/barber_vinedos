'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Elimina las restricciones antiguas
    await queryInterface.removeConstraint('Appointments', 'Appointments_ibfk_1');
    await queryInterface.removeConstraint('Appointments', 'Appointments_ibfk_2');

    // Agrega las nuevas restricciones
    await queryInterface.addConstraint('Appointments', {
      fields: ['stationId'],
      type: 'foreign key',
      name: 'fk_appointments_stations',
      references: {
        table: 'Stations',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('Appointments', {
      fields: ['clientId'],
      type: 'foreign key',
      name: 'fk_appointments_clients',
      references: {
        table: 'Clients',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Elimina las nuevas restricciones
    await queryInterface.removeConstraint('Appointments', 'fk_appointments_stations');
    await queryInterface.removeConstraint('Appointments', 'fk_appointments_clients');

    // Restaura las restricciones antiguas
    await queryInterface.addConstraint('Appointments', {
      fields: ['stationId'],
      type: 'foreign key',
      name: 'Appointments_ibfk_1',
      references: {
        table: 'Stations',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('Appointments', {
      fields: ['clientId'],
      type: 'foreign key',
      name: 'Appointments_ibfk_2',
      references: {
        table: 'Clients',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },
};
