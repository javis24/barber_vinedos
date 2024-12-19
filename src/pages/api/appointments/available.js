import { Op } from 'sequelize';
import Appointment from '../../../models/Appointment';
import Station from '../../../models/Station';

export default async function handler(req, res) {
  const { date, station } = req.query;

  if (!date || !station) {
    return res.status(400).json({ error: 'La fecha y la estación son obligatorias' });
  }

  try {
    // Buscar estación y datos necesarios en una sola consulta
    const stationData = await Station.findOne({
      where: { name: station },
      attributes: ['id', 'weekdayStart', 'weekdayEnd', 'saturdayStart', 'saturdayEnd', 'sundayStart', 'sundayEnd', 'intervalMinutes'],
    });

    if (!stationData) {
      return res.status(404).json({ error: 'Estación no encontrada' });
    }

    // Determinar horarios según el día
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

   
   // Obtener citas reservadas
        const reservedAppointments = await Appointment.findAll({
          where: {
            date,
            stationId: stationData.id,
          },
          attributes: ['time'], // Solo necesitamos las horas
        });

        // Generar lista de horarios reservados (asegúrate de formatear los horarios)
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
