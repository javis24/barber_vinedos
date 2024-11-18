import Client from '../../../models/Client';
import Appointment from '../../../models/Appointment';
import { Op } from 'sequelize';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, phone, datetime } = req.body;

    try {
      // Validar que el horario sea válido
      const appointmentDate = new Date(datetime);
      const dayOfWeek = appointmentDate.getDay();
      const hour = appointmentDate.getHours();
      const minutes = appointmentDate.getMinutes();

      // Horarios permitidos
      const schedules = {
        weekday: { start: { hour: 11, minutes: 0 }, end: { hour: 19, minutes: 30 } },
        saturday: { start: { hour: 11, minutes: 0 }, end: { hour: 18, minutes: 30 } },
        sunday: { start: { hour: 11, minutes: 0 }, end: { hour: 14, minutes: 30 } },
      };

      let validSchedule = false;
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        validSchedule =
          (hour > schedules.weekday.start.hour || (hour === schedules.weekday.start.hour && minutes >= schedules.weekday.start.minutes)) &&
          (hour < schedules.weekday.end.hour || (hour === schedules.weekday.end.hour && minutes <= schedules.weekday.end.minutes));
      } else if (dayOfWeek === 6) {
        validSchedule =
          (hour > schedules.saturday.start.hour || (hour === schedules.saturday.start.hour && minutes >= schedules.saturday.start.minutes)) &&
          (hour < schedules.saturday.end.hour || (hour === schedules.saturday.end.hour && minutes <= schedules.saturday.end.minutes));
      } else if (dayOfWeek === 0) {
        validSchedule =
          (hour > schedules.sunday.start.hour || (hour === schedules.sunday.start.hour && minutes >= schedules.sunday.start.minutes)) &&
          (hour < schedules.sunday.end.hour || (hour === schedules.sunday.end.hour && minutes <= schedules.sunday.end.minutes));
      }

      if (!validSchedule) {
        return res.status(400).json({ error: 'Horario no permitido' });
      }

      // Verificar si el horario ya está ocupado
      const existingAppointment = await Appointment.findOne({
        where: { datetime: datetime },
      });

      if (existingAppointment) {
        return res.status(400).json({ error: 'Este horario ya está ocupado' });
      }

      // Buscar o crear al cliente
      let client = await Client.findOne({ where: { phone } });
      if (!client) {
        client = await Client.create({ name, phone });
      }

      // Crear la cita
      const appointment = await Appointment.create({
        datetime,
        clientId: client.id,
        status: 'scheduled',
      });

      res.status(201).json({ message: 'Cita creada con éxito', appointment });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear la cita' });
    }
  } else if (req.method === 'GET') {
    const { slots } = req.query;

    if (slots === 'true') {
      try {
        const currentDate = new Date();
        const endOfWeek = new Date();
        endOfWeek.setDate(currentDate.getDate() + 7);

        // Generar horarios válidos para los próximos 7 días
        const validSlots = [];
        const schedules = {
          weekday: { start: { hour: 11, minutes: 0 }, end: { hour: 19, minutes: 30 } },
          saturday: { start: { hour: 11, minutes: 0 }, end: { hour: 18, minutes: 30 } },
          sunday: { start: { hour: 11, minutes: 0 }, end: { hour: 14, minutes: 30 } },
        };

        const date = new Date(currentDate);
        while (date <= endOfWeek) {
          const dayOfWeek = date.getDay();
          const schedule =
            dayOfWeek >= 1 && dayOfWeek <= 5
              ? schedules.weekday
              : dayOfWeek === 6
              ? schedules.saturday
              : dayOfWeek === 0
              ? schedules.sunday
              : null;

          if (schedule) {
            date.setHours(schedule.start.hour, schedule.start.minutes, 0, 0);
            while (
              date.getHours() < schedule.end.hour ||
              (date.getHours() === schedule.end.hour && date.getMinutes() <= schedule.end.minutes)
            ) {
              validSlots.push(new Date(date));
              date.setMinutes(date.getMinutes() + 30);
            }
          }

          // Avanzar al día siguiente
          date.setDate(date.getDate() + 1);
        }

        // Obtener citas ya ocupadas
        const appointments = await Appointment.findAll({
          where: {
            datetime: {
              [Op.between]: [currentDate, endOfWeek],
            },
          },
          attributes: ['datetime'],
        });

        const occupiedSlots = appointments.map((app) => app.datetime.toISOString());

        // Filtrar horarios disponibles
        const availableSlots = validSlots
          .filter((slot) => !occupiedSlots.includes(slot.toISOString()))
          .map((slot) => ({
            datetime: slot.toISOString(),
            label: slot.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          }));

        res.status(200).json({ slots: availableSlots });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener horarios disponibles' });
      }
    } else {
      try {
        const appointments = await Appointment.findAll({
          include: [Client],
        });

        res.status(200).json({ appointments });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener citas' });
      }
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
