import { useEffect, useState } from "react";

export default function Registros() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/appointments");
        const data = await response.json();

        if (response.ok) {
          setAppointments(data.appointments);
          filterAppointmentsForToday(data.appointments); // Filtrar por el día actual al inicio
        } else {
          alert("Error al cargar los registros");
        }
      } catch (error) {
        console.error("Error al cargar los registros:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filterAppointmentsForToday = (appointments) => {
    const today = new Date();
    const timeZoneOffset = today.getTimezoneOffset() * 60000;
  
    const startOfToday = new Date(today.getTime() - timeZoneOffset);
    startOfToday.setHours(0, 0, 0, 0);
  
    const endOfToday = new Date(startOfToday);
    endOfToday.setHours(23, 59, 59, 999);
  
    const todayAppointments = appointments.filter((appt) => {
      const appointmentDate = new Date(appt.datetime);
      return appointmentDate >= startOfToday && appointmentDate <= endOfToday;
    });
  
    setFilteredAppointments(todayAppointments);
  };
  
  
  

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchDate) {
      alert("Por favor selecciona una fecha");
      return;
    }
  
    // Crear el rango de fechas manualmente a partir de searchDate
    const startOfSelectedDate = new Date(`${searchDate}T00:00:00`); // Inicio del día
    const endOfSelectedDate = new Date(`${searchDate}T23:59:59`); // Fin del día
  
    // Filtrar las citas dentro del rango
    const filtered = appointments.filter((appt) => {
      const appointmentDate = new Date(appt.datetime); // Fecha almacenada en la base de datos
      return (
        appointmentDate >= startOfSelectedDate &&
        appointmentDate <= endOfSelectedDate
      );
    });
  
    setFilteredAppointments(filtered);
  };
  
  
  

  const markAsCompleted = async (id) => {
    try {
      const response = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "completed" }),
      });

      if (response.ok) {
        alert("Cita marcada como completada");
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === id ? { ...appt, status: "completed" } : appt
          )
        );
        setFilteredAppointments((prev) =>
          prev.map((appt) =>
            appt.id === id ? { ...appt, status: "completed" } : appt
          )
        );
      } else {
        const data = await response.json();
        alert(data.error || "Error al marcar la cita como completada");
      }
    } catch (error) {
      console.error("Error al marcar cita como completada:", error);
    }
  };

  const sendWhatsAppMessage = (phone, name) => {
    if (!phone) {
      alert("El número de teléfono no está disponible.");
      return;
    }

    const message = `Hola ${name}, queremos confirmar tu cita en nuestra barbería. Por favor responde este mensaje si tienes alguna duda.`;
    const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-lg">Cargando registros...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-center text-3xl font-bold mb-8">Registros de Citas</h1>

      {/* Formulario de búsqueda */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex justify-center items-center space-x-4">
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Buscar
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="table-auto w-full bg-gray-800 rounded-lg shadow-lg">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-2">Nombre del Cliente</th>
              <th className="px-4 py-2">Teléfono</th>
              <th className="px-4 py-2">Fecha y Hora</th>
              <th className="px-4 py-2">Estatus</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id} className="border-t border-gray-600">
                <td className="px-4 py-2 text-center">
                  {appointment.Client ? appointment.Client.name : "N/A"}
                </td>
                <td className="px-4 py-2 text-center">
                  {appointment.Client ? appointment.Client.phone : "N/A"}
                </td>
                <td className="px-4 py-2 text-center">
                {new Date(appointment.datetime).toLocaleString("es-MX", {
                  timeZone: "America/Mexico_City",
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>
                <td className="px-4 py-2 text-center capitalize">
                  {appointment.status}
                </td>
                <td className="px-4 py-2 text-center space-x-2">
                  {appointment.status === "scheduled" && (
                    <button
                      onClick={() => markAsCompleted(appointment.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Completada
                    </button>
                  )}
                  <button
                    onClick={() =>
                      sendWhatsAppMessage(
                        appointment.Client?.phone,
                        appointment.Client?.name
                      )
                    }
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    WhatsApp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
