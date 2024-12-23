import { Op } from 'sequelize';
import Appointment from '../../../models/Appointment';
import Station from '../../../models/Station';
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');

export default async function handler(req, res) {
  const { date, station } = req.query;

  if (!date || !station) {
    return res.status(400).json({ error: 'La fecha y la estación son obligatorias' });
  }

  try {
    // Buscar estación y datos necesarios
    const stationData = await Station.findOne({
      where: { name: station },
      attributes: [
        'id',
        'weekdayStart',
        'weekdayEnd',
        'saturdayStart',
        'saturdayEnd',
        'sundayStart',
        'sundayEnd',
        'intervalMinutes',
      ],
    });

    if (!stationData) {
      return res.status(404).json({ error: 'Estación no encontrada' });
    }

    // Verificar si todos los horarios están definidos
    const { weekdayStart, weekdayEnd, saturdayStart, saturdayEnd, sundayStart, sundayEnd, intervalMinutes } = stationData;
    if (!weekdayStart || !weekdayEnd || !saturdayStart || !saturdayEnd || !sundayStart || !sundayEnd || !intervalMinutes) {
      return res.status(500).json({ error: 'Datos incompletos de la estación' });
    }

    const dateObj = new Date(`${date}T00:00:00`);
    const utcDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
    const dayOfWeek = utcDate.getUTCDay(); // Obtén el día de la semana en UTC


    let start, end;

    // Determinar horarios según el día
    if (dayOfWeek === 0) {
      start = sundayStart;
      end = sundayEnd;
    } else if (dayOfWeek === 6) {
      start = saturdayStart;
      end = saturdayEnd;
    } else {
      start = weekdayStart;
      end = weekdayEnd;
    }

    if (!start || !end) {
      return res.status(500).json({ error: 'Horarios no definidos para este día' });
    }

    const times = generateTimes(start, end, intervalMinutes);

    // Obtener citas reservadas
    const reservedAppointments = await Appointment.findAll({
      where: {
        date,
        stationId: stationData.id,
      },
      attributes: ['time'],
    });

    // Generar lista de horarios reservados
    const reservedTimes = reservedAppointments.map((a) => a.time.slice(0, 5)); // Formatear a "HH:mm"

    console.log('Horarios reservados (formateados):', reservedTimes);

    // Generar lista de horarios disponibles
    const availableTimes = times.map((time) => ({
      time,
      reserved: reservedTimes.includes(time),
    }));

    console.log('Horarios generados por la API:', availableTimes);

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
