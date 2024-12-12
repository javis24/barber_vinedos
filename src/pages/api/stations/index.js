import Station from "../../../models/Station";
import sequelize from '../../../config/database';


export default async function handler(req, res) {
  await sequelize.sync(); // Asegúrate de sincronizar la base de datos si aún no está sincronizada

  switch (req.method) {
    case "GET":
      try {
        const stations = await Station.findAll();
        res.status(200).json({ stations });
      } catch (error) {
        console.error("Error al obtener estaciones:", error);
        res.status(500).json({ error: "Error al obtener estaciones" });
      }
      break;

    case "POST":
      try {
        const { name, description } = req.body;
        const station = await Station.create({ name, description });
        res.status(201).json({ station });
      } catch (error) {
        console.error("Error al crear estación:", error);
        res.status(500).json({ error: "Error al crear estación" });
      }
      break;

    case "PUT":
      try {
        const { id } = req.body;
        const { name, description } = req.body;

        const station = await Station.findByPk(id);
        if (!station) {
          return res.status(404).json({ error: "Estación no encontrada" });
        }

        station.name = name;
        station.description = description;
        await station.save();
        res.status(200).json({ station });
      } catch (error) {
        console.error("Error al actualizar estación:", error);
        res.status(500).json({ error: "Error al actualizar estación" });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query;

        const station = await Station.findByPk(id);
        if (!station) {
          return res.status(404).json({ error: "Estación no encontrada" });
        }

        await station.destroy();
        res.status(200).json({ message: "Estación eliminada" });
      } catch (error) {
        console.error("Error al eliminar estación:", error);
        res.status(500).json({ error: "Error al eliminar estación" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Método ${req.method} no permitido`);
  }
}
