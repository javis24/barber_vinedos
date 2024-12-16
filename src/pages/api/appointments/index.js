import models from '../../../models';

const { Appointment, Client, Station } = models;

// Generar horarios disponibles según los horarios de una estación
const generateAvailableSlots = async (stationId, date) => {
  const station = await Station.findByPk(stationId);

  // Si no se encuentra una estación, usar valores predeterminados
  const weekdayStart = station?.weekdayStart || '11:00:00';
  const weekdayEnd = station?.weekdayEnd || '20:00:00';
  const saturdayStart = station?.saturdayStart || '11:00:00';
  const saturdayEnd = station?.saturdayEnd || '20:00:00';
  const sundayStart = station?.sundayStart || '11:00:00';
  const sundayEnd = station?.sundayEnd || '16:00:00';
  const interval = station?.intervalMinutes || 60;

  const dayOfWeek = new Date(date).getDay();
  const startTime =
    dayOfWeek === 0
      ? sundayStart
      : dayOfWeek === 6
      ? saturdayStart
      : weekdayStart;
  const endTime =
    dayOfWeek === 0
      ? sundayEnd
      : dayOfWeek === 6
      ? saturdayEnd
      : weekdayEnd;

  const slots = [];
  let current = new Date(`${date}T${startTime}`);
  const limit = new Date(`${date}T${endTime}`);

  while (current < limit) {
    slots.push({
      datetime: current.toISOString(),
      label: current.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    });
    current = new Date(current.getTime() + interval * 60000);
  }

  return slots;
};


// Validar campos requeridos
const validateFields = (fields, requiredFields) => {
  const missingFields = requiredFields.filter((field) => !fields[field]);
  if (missingFields.length > 0) {
    throw new Error(`Campos faltantes: ${missingFields.join(', ')}`);
  }
};

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { slots, station, date } = req.query;

      if (slots === 'true') {
        validateFields(req.query, ['station', 'date']);

        const availableSlots = await generateAvailableSlots(station, date);

        const appointments = await Appointment.findAll({
          where: {
            stationId: station, // Corregido para filtrar por el campo correcto
            datetime: { [models.Sequelize.Op.like]: `${date}%` },
          },
          attributes: ['datetime', 'status'],
        });

        const reservedTimes = appointments.map((app) => app.datetime);

        const filteredSlots = availableSlots.map((slot) => ({
          ...slot,
          disabled: reservedTimes.includes(slot.datetime),
        }));

        return res.status(200).json({ slots: filteredSlots });
      }

      const appointments = await Appointment.findAll({
        include: [{ model: Client, attributes: ['name', 'phone'] }],
      });

      return res.status(200).json({ appointments });
    }

    if (method === 'POST') {
      const { name, phone, datetime, station } = req.body;
      validateFields(req.body, ['name', 'phone', 'datetime', 'station']);

      const existingAppointment = await Appointment.findOne({
        where: { datetime, stationId: station, status: 'scheduled' },
      });

      if (existingAppointment) {
        return res.status(400).json({ error: 'Este horario ya está reservado para esta estación.' });
      }

      let client = await Client.findOne({ where: { phone } });
      if (!client) {
        client = await Client.create({ name, phone });
      }

      const appointment = await Appointment.create({
        datetime,
        clientId: client.id,
        status: 'scheduled',
        stationId: station,
      });

      return res.status(201).json({ message: 'Cita creada con éxito.', appointment });
    }

    if (method === 'DELETE') {
      const { id } = req.body;
      validateFields(req.body, ['id']);

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada.' });
      }

      await appointment.destroy();
      return res.status(200).json({ message: 'Cita eliminada con éxito.' });
    }

    if (method === 'PATCH') {
      const { id, status } = req.body;
      validateFields(req.body, ['id', 'status']);

      if (!['scheduled', 'completed', 'canceled'].includes(status)) {
        return res.status(400).json({ error: 'Estado inválido.' });
      }

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada.' });
      }

      appointment.status = status;
      await appointment.save();

      return res.status(200).json({ message: 'Estado actualizado con éxito.', appointment });
    }

    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (error) {
    console.error(error.message || 'Error en el servidor');
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
}
