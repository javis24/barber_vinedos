import models from '../../../models';

const { Appointment } = models;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { station, date } = req.query; // Filtrar por estación y fecha

    try {
      const appointments = await Appointment.findAll({
        where: {
          station, // Filtrar por estación
          datetime: {
            $like: `${date}%`, // Filtrar por fecha
          },
        },
        attributes: ['datetime', 'status'],
      });

      res.status(200).json({ appointments });
    } catch (error) {
      console.error('Error al obtener citas:', error);
      res.status(500).json({ error: 'Error al obtener citas.' });
    }
  } else if (req.method === 'POST') {
    const { name, phone, datetime, station } = req.body;

    try {
      const existingAppointment = await Appointment.findOne({
        where: { datetime, station, status: 'scheduled' }, // Validar por estación y horario
      });

      if (existingAppointment) {
        return res.status(400).json({ error: 'Este horario ya está reservado para esta estación.' });
      }

      // Crear cita en la base de datos
      const appointment = await Appointment.create({
        datetime,
        station,
        status: 'scheduled',
        clientName: name,
        clientPhone: phone,
      });

      res.status(201).json({ message: 'Cita creada con éxito', appointment });
    } catch (error) {
      console.error('Error al crear cita:', error);
      res.status(500).json({ error: 'Error al crear cita.' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido.' });
  }
}
