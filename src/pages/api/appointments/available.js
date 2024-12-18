import { Op } from 'sequelize';
import Appointment from '../../../models/Appointment';
import Station from '../../../models/Station';

export default async function handler(req, res) {
  const { date, station } = req.query;

  if (!date || !station) {
    return res.status(400).json({ error: 'La fecha y la estación son obligatorias' });
  }

  try {
    // Buscar la estación específica
    const stationData = await Station.findOne({ where: { name: station } });

    if (!stationData) {
      return res.status(404).json({ error: 'Estación no encontrada' });
    }

    // Generar horarios según el día
    const dayOfWeek = new Date(date).getDay();
    let start, end;

    if (dayOfWeek === 0) {
      start = stationData.sundayStart;
      end = stationData.sundayEnd;
    } else if (dayOfWeek === 6) {
      start = stationData.saturdayStart;
      end = stationData.saturdayEnd;
    } else {
      start = stationData.weekdayStart;
      end = stationData.weekdayEnd;
    }

    const times = generateTimes(start, end, stationData.intervalMinutes);

    // Obtener las citas reservadas SOLO para esta estación
    const reservedAppointments = await Appointment.findAll({
      where: {
        date,
        stationId: stationData.id, // Filtra SOLO por la estación seleccionada
      },
    });

    const reservedTimes = reservedAppointments.map((a) => a.time);

    // Generar lista de horarios disponibles
    const availableTimes = times.map((time) => ({
      time,
      reserved: reservedTimes.includes(time),
    }));

    res.status(200).json({ times: availableTimes });
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    res.status(500).json({ error: 'Error al obtener los horarios disponibles' });
  }
}

function generateTimes(start, end, interval) {
  const times = [];
  let [startHour, startMinute] = start.split(':').map(Number);
  let [endHour, endMinute] = end.split(':').map(Number);

  let current = new Date(1970, 0, 1, startHour, startMinute);
  const endTime = new Date(1970, 0, 1, endHour, endMinute);

  while (current <= endTime) {
    const formattedTime = current.toTimeString().slice(0, 5); // Formato HH:mm
    times.push(formattedTime);
    current.setMinutes(current.getMinutes() + interval);
  }

  return times;
}
