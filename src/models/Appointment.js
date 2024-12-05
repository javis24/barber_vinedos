import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'canceled', 'completed'),
    defaultValue: 'scheduled',
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  station: {
    type: DataTypes.STRING, 
    allowNull: false, 
  },
});

export default Appointment;
