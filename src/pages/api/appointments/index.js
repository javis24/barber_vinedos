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

    // Asegurarse de calcular el próximo lunes correctamente
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

    // Generar horarios dentro del rango permitido
    while (current <= limit) {
      slots.push({
        day: dayName,
        date: currentDay.toISOString().split("T")[0], // Fecha
        datetime: current.toISOString(), // Fecha y hora completas
        label: `${dayName}, ${current.toLocaleDateString()} - ${current.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      });

      current = new Date(current.getTime() + incrementMinutes * 60000); // Incrementar 45 minutos
    }
  }

  return slots;
};




export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (req.query.slots === 'true') {
      try {
        const availableSlots = generateAvailableSlots();

        // Obtener citas existentes
        const appointments = await Appointment.findAll({
          attributes: ['datetime', 'status'],
        });

        const bookedTimes = appointments
          .filter((app) => app.status === 'scheduled') // Solo horarios "scheduled"
          .map((app) => app.datetime);

        // Filtrar horarios ocupados
        const filteredSlots = availableSlots.filter(
          (slot) => !bookedTimes.includes(slot.datetime)
        );

        return res.status(200).json({ slots: filteredSlots });
      } catch (error) {
        console.error('Error al generar horarios disponibles:', error);
        return res.status(500).json({ error: 'Error al generar horarios disponibles' });
      }
    }

    // Si no se especifica `slots=true`, devolver todas las citas
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
      const { name, phone, datetime } = req.body;

      // Validar campos requeridos
      if (!name || !phone || !datetime) {
        return res.status(400).json({ error: 'El nombre, teléfono y horario son obligatorios' });
      }

      // Validar cita duplicada
      const existingAppointment = await Appointment.findOne({ where: { datetime, status: 'scheduled' } });
      if (existingAppointment) {
        return res.status(400).json({ error: 'Este horario ya está reservado.' });
      }

      // Verificar o crear cliente
      let client = await Client.findOne({ where: { phone } });
      if (!client) {
        client = await Client.create({ name, phone });
      }

      // Crear cita
      const appointment = await Appointment.create({
        datetime,
        clientId: client.id,
        status: 'scheduled',
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

      // Validar campos obligatorios
      if (!id || !status) {
        return res.status(400).json({ error: 'ID y estado son obligatorios' });
      }

      // Validar que el estado es válido
      if (!['scheduled', 'completed', 'canceled'].includes(status)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }

      // Buscar la cita por ID
      const appointment = await Appointment.findByPk(id);

      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Actualizar el estado de la cita
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
