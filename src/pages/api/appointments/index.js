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


async function createAppointment(req, res) {
  const { date, time, station, name, phone } = req.body;

  if (!date || !time || !station || !name || !phone) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Buscar la estación por nombre
    const stationData = await Station.findOne({ where: { name: station } });
    if (!stationData) {
      return res.status(404).json({ error: 'Estación no encontrada' });
    }

    // Buscar o crear cliente por nombre y teléfono
    let clientData = await Client.findOne({ where: { name, phone } });
    if (!clientData) {
      clientData = await Client.create({ name, phone });
    }

    // Crear la cita con los IDs
    const appointment = await Appointment.create({
      date,
      time,
      stationId: stationData.id,
      clientId: clientData.id,
    });

    res.status(201).json({ message: 'Cita creada con éxito', appointment });
  } catch (error) {
    console.error('Error al crear la cita:', error);
    res.status(500).json({ error: 'Error al crear la cita', details: error.message });
  }
}



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
