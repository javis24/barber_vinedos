import { useEffect, useState } from "react";

export default function Registros() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState(
    new Date().toISOString().split("T")[0] // Fecha actual como valor inicial
  );

  // Función para ordenar las citas por proximidad a la hora actual
  const sortAppointmentsByProximity = (appointments) => {
    const now = new Date();
    return appointments.sort(
      (a, b) => new Date(a.datetime) - now - (new Date(b.datetime) - now)
    );
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/appointments");
        const data = await response.json();

        if (response.ok) {
          console.log("Datos recibidos:", data.appointments);
          setAppointments(data.appointments);

          // Filtrar las citas del día actual al cargar
          filterAppointmentsByDate(new Date().toISOString().split("T")[0], data.appointments);
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

  const filterAppointmentsByDate = (date, allAppointments = appointments) => {
    console.log("Filtrando citas para la fecha:", date);

    const filtered = allAppointments.filter((appt) => appt.date === date);
    const sorted = sortAppointmentsByProximity(filtered);

    setFilteredAppointments(sorted);
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchDate) {
      alert("Por favor selecciona una fecha");
      return;
    }

    filterAppointmentsByDate(searchDate);
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
              <th className="px-4 py-2">Estación</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="border-t border-gray-600">
                  <td className="px-4 py-2 text-center">
                    {appointment.Client?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {appointment.Client?.phone || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {`${appointment.date} ${appointment.time}`}
                  </td>
                  <td className="px-4 py-2 text-center capitalize">
                    {appointment.status}
                  </td>
                  <td className="px-4 py-2 text-center capitalize">
                    {appointment.Station?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => markAsCompleted(appointment.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Completada
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No hay citas disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
