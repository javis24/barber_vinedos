import models from '../../../models';

const { Appointment, Client } = models;

const generateAvailableSlots = () => {
  const slots = [];
  const startTimes = {
    weekday: "11:00",
    saturday: "10:00",
    sunday: "11:00",
  };
  const endTimes = {
    weekday: "20:00",
    saturday: "19:00",
    sunday: "15:00",
  };

  const incrementMinutes = 45; // Intervalos de 45 minutos
  const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const today = new Date();

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const currentDay = new Date(today);
    currentDay.setDate(today.getDate() + dayIndex);

    const dayName = daysOfWeek[currentDay.getDay()];
    const start = dayName === "Sábado" ? startTimes.saturday :
                  dayName === "Domingo" ? startTimes.sunday :
                  startTimes.weekday;

    const end = dayName === "Sábado" ? endTimes.saturday :
                dayName === "Domingo" ? endTimes.sunday :
                endTimes.weekday;

    let current = new Date(`${currentDay.toISOString().split("T")[0]}T${start}:00`);
    const limit = new Date(`${currentDay.toISOString().split("T")[0]}T${end}:00`);

    while (current <= limit) {
      slots.push({
        day: dayName,
        date: currentDay.toISOString().split("T")[0],
        datetime: current.toISOString(),
        label: `${dayName}, ${current.toLocaleDateString()} - ${current.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      });
      current = new Date(current.getTime() + incrementMinutes * 60000);
    }
  }

  return slots;
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (req.query.slots === 'true') {
      const { station } = req.query; // Filtrar por estación
      try {
        const availableSlots = generateAvailableSlots();

        const appointments = await Appointment.findAll({
          where: { station }, // Filtrar por estación
          attributes: ['datetime', 'status'],
        });

        const bookedTimes = appointments
          .filter((app) => app.status === 'scheduled') // Solo horarios "scheduled"
          .map((app) => app.datetime);

        const filteredSlots = availableSlots.filter(
          (slot) => !bookedTimes.includes(slot.datetime)
        );

        return res.status(200).json({ slots: filteredSlots });
      } catch (error) {
        console.error('Error al generar horarios disponibles:', error);
        return res.status(500).json({ error: 'Error al generar horarios disponibles' });
      }
    }

    try {
      const appointments = await Appointment.findAll({
        include: [{ model: Client, attributes: ['name', 'phone'] }],
      });
      res.status(200).json({ appointments });
    } catch (error) {
      console.error('Error al obtener citas:', error);
      res.status(500).json({ error: 'Error al obtener citas' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, phone, datetime, station } = req.body;

      if (!name || !phone || !datetime || !station) {
        return res.status(400).json({ error: 'El nombre, teléfono, horario y estación son obligatorios' });
      }

      const existingAppointment = await Appointment.findOne({
        where: { datetime, station, status: 'scheduled' }, // Validar por estación y horario
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
        station,
      });

      res.status(201).json({ message: 'Cita creada con éxito', appointment });
    } catch (error) {
      console.error('Error al crear cita:', error);
      res.status(500).json({ error: 'Error al crear cita' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      await appointment.destroy();
      res.status(200).json({ message: 'Cita eliminada con éxito' });
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      res.status(500).json({ error: 'Error al eliminar cita' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { id, status } = req.body;

      if (!id || !status) {
        return res.status(400).json({ error: 'ID y estado son obligatorios' });
      }

      if (!['scheduled', 'completed', 'canceled'].includes(status)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      appointment.status = status;
      await appointment.save();

      res.status(200).json({ message: 'Estado actualizado con éxito', appointment });
    } catch (error) {
      console.error('Error al actualizar el estado de la cita:', error);
      res.status(500).json({ error: 'Error al actualizar el estado de la cita' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
