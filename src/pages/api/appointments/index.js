import { Appointment, Station, Client } from "../../../models";

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      return await getAppointments(req, res);
    case "POST":
      return await createAppointment(req, res); // Función para crear la cita
    case "PATCH":
      return await updateAppointment(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST", "PATCH"]);
      return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}

// Función para obtener todas las citas
async function getAppointments(req, res) {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: Client, as: "Client", attributes: ["name", "phone"] }, // Especifica 'as'
        { model: Station, as: "Station", attributes: ["name"] },       // Especifica 'as'
      ],
    });
    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.status(500).json({ error: "Error al obtener las citas" });
  }
}


const createAppointment = async (req, res) => {
  const { date, time, stationId, clientId } = req.body;

  console.log('Datos recibidos en la API:', { date, time, stationId, clientId });

  if (!date || !time || !stationId || !clientId) {
      console.error('Datos faltantes en la solicitud:', { date, time, stationId, clientId });
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
      // Verificar si el horario ya está reservado
      const existingAppointment = await Appointment.findOne({
          where: { date, time, stationId },
      });

      if (existingAppointment) {
          console.warn('Horario ya reservado:', { date, time, stationId });
          return res
              .status(400)
              .json({ error: 'El horario ya está reservado. Por favor, selecciona otro.' });
      }

      // Crear la cita si no está reservada
      const appointment = await Appointment.create({
          date,
          time,
          stationId,
          clientId,
          status: 'scheduled',
      });

      console.log('Cita creada exitosamente:', appointment);
      res.status(201).json({ message: 'Cita creada con éxito', appointment });
  } catch (error) {
      console.error('Error al crear la cita:', error);
      res.status(500).json({ error: 'Error al crear la cita' });
  }
};


// Función para actualizar una cita
async function updateAppointment(req, res) {
  const { id, status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ error: "ID y estatus son requeridos" });
  }

  try {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ message: "Cita actualizada con éxito", appointment });
  } catch (error) {
    console.error("Error al actualizar la cita:", error);
    res.status(500).json({ error: "Error al actualizar la cita" });
  }
}
