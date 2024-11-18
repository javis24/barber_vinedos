import { DateTime } from 'luxon';
import Client from '../../../models/Client';
import Appointment from '../../../models/Appointment';
import { Op } from 'sequelize';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, phone, datetime } = req.body;

    try {
      // Interpreta la fecha enviada directamente como local
      const appointmentDate = DateTime.fromISO(datetime, { zone: 'America/Mexico_City' });
      const dayOfWeek = appointmentDate.weekday; // 1 = Lunes, ..., 7 = Domingo
      const hour = appointmentDate.hour;
      const minutes = appointmentDate.minute;

      console.log('Day of Week (Local):', dayOfWeek);
      console.log('Hour (Local):', hour, 'Minutes (Local):', minutes);

      // Definir horarios permitidos en hora local
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
      } else if (dayOfWeek === 7) {
        validSchedule =
          (hour > schedules.sunday.start.hour || (hour === schedules.sunday.start.hour && minutes >= schedules.sunday.start.minutes)) &&
          (hour < schedules.sunday.end.hour || (hour === schedules.sunday.end.hour && minutes <= schedules.sunday.end.minutes));
      }

      if (!validSchedule) {
        console.log('Horario rechazado (Local):', appointmentDate.toISO());
        return res.status(400).json({ error: 'Horario no permitido' });
      }

      // Verificar si el horario ya está ocupado
      const existingAppointment = await Appointment.findOne({
        where: { datetime },
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
        const currentDate = DateTime.local().setZone('America/Mexico_City');
        const endOfWeek = currentDate.plus({ days: 7 });

        const validSlots = [];
        const schedules = {
          weekday: { start: { hour: 11, minutes: 0 }, end: { hour: 19, minutes: 30 } },
          saturday: { start: { hour: 11, minutes: 0 }, end: { hour: 18, minutes: 30 } },
          sunday: { start: { hour: 11, minutes: 0 }, end: { hour: 14, minutes: 30 } },
        };

        let date = currentDate.startOf('day');
        while (date <= endOfWeek) {
          const dayOfWeek = date.weekday;
          const schedule =
            dayOfWeek >= 1 && dayOfWeek <= 5
              ? schedules.weekday
              : dayOfWeek === 6
              ? schedules.saturday
              : dayOfWeek === 7
              ? schedules.sunday
              : null;

          if (schedule) {
            date = date.set({ hour: schedule.start.hour, minute: schedule.start.minutes });
            while (
              date.hour < schedule.end.hour ||
              (date.hour === schedule.end.hour && date.minute <= schedule.end.minutes)
            ) {
              validSlots.push(date.toISO());
              date = date.plus({ minutes: 30 });
            }
          }

          date = date.plus({ days: 1 }).startOf('day');
        }

        const appointments = await Appointment.findAll({
          where: {
            datetime: {
              [Op.between]: [currentDate.toJSDate(), endOfWeek.toJSDate()],
            },
          },
          attributes: ['datetime'],
        });

        const occupiedSlots = appointments.map((app) => app.datetime.toISOString());
        const availableSlots = validSlots
          .filter((slot) => !occupiedSlots.includes(slot))
          .map((slot) => ({
            datetime: slot,
            label: DateTime.fromISO(slot).toLocaleString(DateTime.DATETIME_SHORT),
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
